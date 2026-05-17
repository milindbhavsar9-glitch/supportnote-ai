import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/auth/request-context";
import { canOpenAdmin } from "@/lib/auth/roles";
import { missingSessionResponse } from "@/lib/reports/api";
import { addReportAuditLog } from "@/lib/reports/audit";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const reviewSchema = z.object({
  reportType: z.enum(["shift", "incident"])
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestContext = await getRequestContext(request);
  if (!requestContext) return missingSessionResponse();
  if (requestContext.mode === "auth" && !canOpenAdmin(requestContext.profile.role)) {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }
  const sessionId = requestContext.mode === "demo" ? requestContext.sessionId : requestContext.profile.id;

  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Report type is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const table = parsed.data.reportType === "shift" ? "shift_reports" : "incident_reports";
    let updateQuery = supabase
      .from(table)
      .update({
        status: "reviewed",
        reviewed_at: new Date().toISOString(),
        reviewed_by: requestContext.mode === "auth" ? requestContext.profile.id : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    updateQuery =
      requestContext.mode === "auth"
        ? updateQuery.eq("company_id", requestContext.profile.company_id)
        : updateQuery.contains("form_data", { client_session_id: sessionId });
    const { data, error } = await updateQuery
      .select("id, status")
      .single();

    if (error) throw new Error(error.message);

    await addReportAuditLog({
      reportId: id,
      reportType: parsed.data.reportType,
      action: "reviewed",
      newStatus: "reviewed",
      sessionId
    });

    return NextResponse.json({ report: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not mark report as reviewed." },
      { status: 500 }
    );
  }
}
