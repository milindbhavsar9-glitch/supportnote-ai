import { NextResponse } from "next/server";
import {
  getClientSessionId,
  getShiftReportForSession,
  missingSessionResponse
} from "@/lib/reports/api";
import {
  getShiftReportFlags,
  shiftReportFormSchema
} from "@/lib/reports/shift-report";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const { data, error } = await getShiftReportForSession(id, sessionId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ report: data });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const body = (await request.json()) as unknown;
  const parsed = shiftReportFormSchema.safeParse(
    typeof body === "object" && body !== null && "form" in body
      ? (body as { form: unknown }).form
      : body
  );

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const form = parsed.data;
  if (form.clientSessionId !== sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const existing = await getShiftReportForSession(id, sessionId);

  if (existing.error) {
    return NextResponse.json({ error: existing.error.message }, { status: 404 });
  }

  const flags = getShiftReportFlags(form);
  const finalReport =
    typeof body === "object" && body !== null && "finalReport" in body
      ? String((body as { finalReport: unknown }).finalReport ?? "")
      : "";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shift_reports")
    .update({
      participant_name: form.participantName,
      staff_name: form.staffName,
      report_date: form.reportDate,
      shift_type: form.shiftType,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      incident_flag: flags.incidentFlag,
      medication_issue_flag: flags.medicationIssueFlag,
      behaviour_issue_flag: flags.behaviourIssueFlag,
      line_of_sight_issue_flag: flags.lineOfSightIssueFlag,
      supervisor_notified: flags.supervisorNotified,
      form_data: { ...form, client_session_id: sessionId },
      final_report: finalReport,
      signature: form.signature || null,
      time_completed: form.timeCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ report: data });
}
