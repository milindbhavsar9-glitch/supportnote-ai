import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import { canOpenAdmin } from "@/lib/auth/roles";
import {
  getCompanyIncidentReports,
  getCompanyShiftReports,
  getDemoIncidentReports,
  getDemoShiftReports,
  getReportComments,
  normalizeStatus
} from "@/lib/admin/demo-admin";
import { missingSessionResponse } from "@/lib/reports/api";

export async function GET(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();
  if (context.mode === "auth" && !canOpenAdmin(context.profile.role)) {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.trim();
  const flag = searchParams.get("flag")?.trim();
  const staff = searchParams.get("staff")?.trim().toLowerCase();

  try {
    const [shiftReports, incidentReports] = await Promise.all([
      context.mode === "auth" && context.profile.company_id
        ? getCompanyShiftReports(context.profile.company_id)
        : getDemoShiftReports(context.sessionId),
      context.mode === "auth" && context.profile.company_id
        ? getCompanyIncidentReports(context.profile.company_id)
        : getDemoIncidentReports(context.sessionId)
    ]);

    const reports = await Promise.all([
      ...shiftReports.map(async (report) => ({
        id: report.id,
        type: "shift" as const,
        participantName: report.participant_name,
        staffName: report.staff_name,
        date: report.report_date,
        status: normalizeStatus(report),
        incidentFlag: Boolean(report.incident_flag),
        medicationIssueFlag: Boolean(report.medication_issue_flag),
        lineOfSightIssueFlag: Boolean(report.line_of_sight_issue_flag),
        needsReview: ["submitted", "completed", "late"].includes(normalizeStatus(report)),
        finalReport: report.final_report,
        comments: await getReportComments(report.id, "shift")
      })),
      ...incidentReports.map(async (report) => ({
        id: report.id,
        type: "incident" as const,
        participantName: report.participant_name,
        staffName: report.staff_name,
        date: report.incident_date,
        status: normalizeStatus(report),
        incidentType: report.incident_type,
        incidentFlag: true,
        medicationIssueFlag: ["Medication error", "Task / procedure error"].includes(report.incident_type),
        lineOfSightIssueFlag: Boolean(report.line_of_sight_issue_flag),
        needsReview: ["submitted", "completed", "late"].includes(normalizeStatus(report)),
        finalReport: report.final_report,
        comments: await getReportComments(report.id, "incident")
      }))
    ]);

    const filtered = reports
      .filter((report) => !staff || report.staffName.toLowerCase().includes(staff))
      .filter((report) => !status || report.status === status)
      .filter((report) => {
        if (!flag) return true;
        if (flag === "incident") return report.incidentFlag;
        if (flag === "medication") return report.medicationIssueFlag;
        if (flag === "line_of_sight") return report.lineOfSightIssueFlag;
        if (flag === "needs_review") return report.needsReview;
        return true;
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    return NextResponse.json({ reports: filtered });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load admin reports." },
      { status: 500 }
    );
  }
}
