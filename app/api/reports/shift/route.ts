import { NextResponse } from "next/server";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import {
  getShiftReportFlags,
  shiftReportFormSchema
} from "@/lib/reports/shift-report";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
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

  const flags = getShiftReportFlags(form);
  const finalReport =
    typeof body === "object" && body !== null && "finalReport" in body
      ? String((body as { finalReport: unknown }).finalReport ?? "")
      : "";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("shift_reports")
      .insert({
        participant_name: form.participantName,
        staff_name: form.staffName,
        report_date: form.reportDate,
        shift_type: form.shiftType,
        start_time: form.startTime || null,
        end_time: form.endTime || null,
        status: "draft",
        incident_flag: flags.incidentFlag,
        medication_issue_flag: flags.medicationIssueFlag,
        behaviour_issue_flag: flags.behaviourIssueFlag,
        line_of_sight_issue_flag: flags.lineOfSightIssueFlag,
        supervisor_notified: flags.supervisorNotified,
        form_data: { ...form, client_session_id: sessionId },
        final_report: finalReport,
        signature: form.signature || null,
        time_completed: form.timeCompleted ? new Date().toISOString() : null
      })
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create report." },
      { status: 500 }
    );
  }
}
