import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AdminReportType = "shift" | "incident";

export function demoReference(type: "staff" | "participant", sessionId: string) {
  return `${type}:${sessionId}`;
}

export function weekStartIso() {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - diff);
  return start.toISOString();
}

export function isLateReport(report: { created_at?: string | null; status?: string | null }) {
  if (!report.created_at || report.status === "completed" || report.status === "reviewed") {
    return false;
  }

  return Date.now() - new Date(report.created_at).getTime() > 24 * 60 * 60 * 1000;
}

export function normalizeStatus(report: { created_at?: string | null; status?: string | null }) {
  return isLateReport(report) ? "late" : report.status || "draft";
}

export async function getDemoShiftReports(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shift_reports")
    .select(
      "id, participant_name, staff_name, report_date, status, incident_flag, medication_issue_flag, behaviour_issue_flag, line_of_sight_issue_flag, supervisor_notified, created_at, updated_at, submitted_at, completed_at, final_report"
    )
    .contains("form_data", { client_session_id: sessionId })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDemoIncidentReports(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("incident_reports")
    .select(
      "id, participant_name, staff_name, incident_date, incident_type, status, supervisor_notified, emergency_services_contacted, injury_flag, line_of_sight_issue_flag, created_at, updated_at, submitted_at, completed_at, final_report"
    )
    .contains("form_data", { client_session_id: sessionId })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getReportComments(reportId: string, reportType: AdminReportType) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("report_comments")
    .select("id, comment, created_at")
    .eq("report_id", reportId)
    .eq("report_type", reportType)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
