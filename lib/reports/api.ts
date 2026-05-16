import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export function getClientSessionId(request: Request) {
  return request.headers.get("x-supportnote-session")?.trim() ?? "";
}

export function missingSessionResponse() {
  return NextResponse.json(
    { error: "Missing demo session. Refresh the page and try again." },
    { status: 400 }
  );
}

export function getReportSelect() {
  return `
    id,
    participant_name,
    staff_name,
    report_date,
    shift_type,
    start_time,
    end_time,
    status,
    incident_flag,
    medication_issue_flag,
    behaviour_issue_flag,
    line_of_sight_issue_flag,
    supervisor_notified,
    form_data,
    final_report,
    signature,
    time_completed,
    submitted_at,
    completed_at,
    created_at,
    updated_at
  `;
}

export async function getShiftReportForSession(id: string, sessionId: string) {
  const supabase = getSupabaseAdmin();
  return supabase
    .from("shift_reports")
    .select(getReportSelect())
    .eq("id", id)
    .contains("form_data", { client_session_id: sessionId })
    .single();
}
