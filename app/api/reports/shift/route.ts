import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import { getSubscriptionStatusForSession, isLimitReached } from "@/lib/billing/subscription";
import { hasCurrentLegalAcceptance } from "@/lib/legal/policies";
import { addReportAuditLog } from "@/lib/reports/audit";
import { missingSessionResponse } from "@/lib/reports/api";
import {
  getShiftReportFlags,
  shiftReportFormSchema
} from "@/lib/reports/shift-report";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();
  const sessionId = context.mode === "demo" ? context.sessionId : context.profile.id;

  if (context.mode === "auth" && !(await hasCurrentLegalAcceptance(context.profile.id))) {
    return NextResponse.json(
      {
        error:
          "You must accept the current Terms, Privacy Policy, Data Handling Notice, and AI Disclaimer before creating reports."
      },
      { status: 428 }
    );
  }

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
  if (context.mode === "demo" && form.clientSessionId !== sessionId) return missingSessionResponse();

  const subscription = await getSubscriptionStatusForSession(sessionId);
  if (
    isLimitReached({
      used: subscription.usage.shiftReportsUsed,
      limit: subscription.limits.shiftReports
    })
  ) {
    return NextResponse.json(
      {
        error: `Your ${subscription.planName} shift report limit has been reached. Upgrade your plan in Billing Settings.`
      },
      { status: 402 }
    );
  }

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
        user_id: context.mode === "auth" ? context.profile.id : null,
        company_id: context.mode === "auth" ? context.profile.company_id : null,
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
        form_data: { ...form, client_session_id: sessionId, auth_mode: context.mode },
        final_report: finalReport,
        signature: form.signature || null,
        time_completed: form.timeCompleted ? new Date().toISOString() : null
      })
      .select("id, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await addReportAuditLog({
      reportId: data.id,
      reportType: "shift",
      action: "created",
      newStatus: data.status,
      sessionId
    });

    return NextResponse.json({ report: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create report." },
      { status: 500 }
    );
  }
}
