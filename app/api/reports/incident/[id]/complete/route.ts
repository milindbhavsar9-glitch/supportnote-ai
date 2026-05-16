import { NextResponse } from "next/server";
import {
  getClientSessionId,
  getIncidentReportForSession,
  missingSessionResponse
} from "@/lib/reports/api";
import { addReportAuditLog } from "@/lib/reports/audit";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const existing = await getIncidentReportForSession(id, sessionId);
  if (existing.error) {
    return NextResponse.json({ error: "Incident report not found." }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("incident_reports")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await addReportAuditLog({
    reportId: id,
    reportType: "incident",
    action: "completed",
    previousStatus: String((existing.data as { status?: string }).status || ""),
    newStatus: data.status,
    sessionId
  });

  return NextResponse.json({ report: data });
}
