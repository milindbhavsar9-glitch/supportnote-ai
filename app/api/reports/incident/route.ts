import { NextResponse } from "next/server";
import { getSubscriptionStatusForSession, isLimitReached } from "@/lib/billing/subscription";
import { addReportAuditLog } from "@/lib/reports/audit";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import {
  getIncidentReportFlags,
  incidentReportFormSchema
} from "@/lib/reports/incident-report";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

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
  if (form.clientSessionId !== sessionId) return missingSessionResponse();

  const subscription = await getSubscriptionStatusForSession(sessionId);
  if (
    isLimitReached({
      used: subscription.usage.incidentReportsUsed,
      limit: subscription.limits.incidentReports
    })
  ) {
    return NextResponse.json(
      {
        error: `Your ${subscription.planName} incident report limit has been reached. Upgrade your plan in Billing Settings.`
      },
      { status: 402 }
    );
  }

  const flags = getIncidentReportFlags(form);
  const finalReport =
    typeof body === "object" && body !== null && "finalReport" in body
      ? String((body as { finalReport: unknown }).finalReport ?? "")
      : "";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("incident_reports")
      .insert({
        participant_name: form.participantName,
        staff_name: form.staffName,
        incident_date: form.incidentDate,
        incident_time: form.incidentTime || null,
        location: form.location,
        incident_type: form.incidentType,
        status: "draft",
        supervisor_notified: flags.supervisorNotified,
        family_guardian_notified: form.familyGuardianNotified,
        emergency_services_contacted: flags.emergencyServicesContacted,
        injury_flag: flags.injuryFlag,
        line_of_sight_issue_flag: flags.lineOfSightIssueFlag,
        form_data: { ...form, client_session_id: sessionId },
        final_report: finalReport,
        signature: form.signature || null,
        time_completed: form.timeCompleted ? new Date().toISOString() : null
      })
      .select("id, status")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await addReportAuditLog({
      reportId: data.id,
      reportType: "incident",
      action: "created",
      newStatus: data.status,
      sessionId
    });

    return NextResponse.json({ report: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create incident report." },
      { status: 500 }
    );
  }
}
