import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import {
  getIncidentReportForContext,
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
  const existing = await getIncidentReportForContext(id, requestContext);
  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Incident report not found." }, { status: 404 });
  }

  const existingReport = existing.data as unknown as { created_at: string };
  const createdAt = new Date(existingReport.created_at);
  const isLate = Date.now() - createdAt.getTime() > 24 * 60 * 60 * 1000;
  const nextStatus = isLate ? "late" : "submitted";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("incident_reports")
    .update({
      status: nextStatus,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await addReportAuditLog({
    reportId: id,
    reportType: "incident",
    action: "submitted",
    previousStatus: String((existing.data as { status?: string }).status || ""),
    newStatus: data.status,
    sessionId
  });

  return NextResponse.json({ report: data });
}
