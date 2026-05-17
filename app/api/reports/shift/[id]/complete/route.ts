import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import {
  getShiftReportForContext,
  missingSessionResponse
} from "@/lib/reports/api";
import { addReportAuditLog } from "@/lib/reports/audit";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const requestContext = await getRequestContext(request);
  if (!requestContext) return missingSessionResponse();
  const sessionId = requestContext.mode === "demo" ? requestContext.sessionId : requestContext.profile.id;

  const { id } = await context.params;
  const existing = await getShiftReportForContext(id, requestContext);

  if (existing.error) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shift_reports")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await addReportAuditLog({
    reportId: id,
    reportType: "shift",
    action: "completed",
    previousStatus: String((existing.data as { status?: string }).status || ""),
    newStatus: data.status,
    sessionId
  });

  return NextResponse.json({ report: data });
}
