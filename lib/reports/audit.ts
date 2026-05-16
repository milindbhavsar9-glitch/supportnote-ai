import { getSupabaseAdmin } from "@/lib/supabase/server";

type AuditInput = {
  reportId: string;
  reportType: "shift" | "incident";
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  sessionId: string;
};

export async function addReportAuditLog(input: AuditInput) {
  const supabase = getSupabaseAdmin();
  await supabase.from("report_audit_logs").insert({
    report_id: input.reportId,
    report_type: input.reportType,
    action: input.action,
    previous_status: input.previousStatus || null,
    new_status: input.newStatus || null,
    metadata: { client_session_id: input.sessionId }
  });
}
