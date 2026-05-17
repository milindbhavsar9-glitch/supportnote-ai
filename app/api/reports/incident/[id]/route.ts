import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import {
  getIncidentReportForContext,
  missingSessionResponse
} from "@/lib/reports/api";
import { addReportAuditLog } from "@/lib/reports/audit";
import {
  getIncidentReportFlags,
  incidentReportFormSchema
} from "@/lib/reports/incident-report";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const requestContext = await getRequestContext(request);
  if (!requestContext) return missingSessionResponse();

  const { id } = await context.params;
  const { data, error } = await getIncidentReportForContext(id, requestContext);

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ report: data });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const requestContext = await getRequestContext(request);
  if (!requestContext) return missingSessionResponse();
  const sessionId = requestContext.mode === "demo" ? requestContext.sessionId : requestContext.profile.id;

  const body = (await request.json()) as unknown;
  const parsed = incidentReportFormSchema.safeParse(
    typeof body === "object" && body !== null && "form" in body
      ? (body as { form: unknown }).form
      : body
  );

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const form = parsed.data;
  if (requestContext.mode === "demo" && form.clientSessionId !== sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const existing = await getIncidentReportForContext(id, requestContext);
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 404 });

  const flags = getIncidentReportFlags(form);
  const finalReport =
    typeof body === "object" && body !== null && "finalReport" in body
      ? String((body as { finalReport: unknown }).finalReport ?? "")
      : "";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("incident_reports")
    .update({
      participant_name: form.participantName,
      staff_name: form.staffName,
      incident_date: form.incidentDate,
      incident_time: form.incidentTime || null,
      location: form.location,
      incident_type: form.incidentType,
      supervisor_notified: flags.supervisorNotified,
      family_guardian_notified: form.familyGuardianNotified,
      emergency_services_contacted: flags.emergencyServicesContacted,
      injury_flag: flags.injuryFlag,
      line_of_sight_issue_flag: flags.lineOfSightIssueFlag,
      form_data: { ...form, client_session_id: sessionId, auth_mode: requestContext.mode },
      final_report: finalReport,
      signature: form.signature || null,
      time_completed: form.timeCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const existingStatus = (existing.data as unknown as { status?: string }).status;
  await addReportAuditLog({
    reportId: id,
    reportType: "incident",
    action: "updated",
    previousStatus: String(existingStatus || ""),
    newStatus: data.status,
    sessionId
  });

  return NextResponse.json({ report: data });
}
