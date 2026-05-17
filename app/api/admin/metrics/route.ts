import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import { canOpenAdmin } from "@/lib/auth/roles";
import {
  getCompanyIncidentReports,
  getCompanyShiftReports,
  getDemoIncidentReports,
  getDemoShiftReports,
  isLateReport,
  normalizeStatus,
  weekStartIso
} from "@/lib/admin/demo-admin";
import { missingSessionResponse } from "@/lib/reports/api";

export async function GET(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();
  if (context.mode === "auth" && !canOpenAdmin(context.profile.role)) {
    return NextResponse.json({ error: "Admin access is required." }, { status: 403 });
  }

  try {
    const [shiftReports, incidentReports] = await Promise.all([
      context.mode === "auth" && context.profile.company_id
        ? getCompanyShiftReports(context.profile.company_id)
        : getDemoShiftReports(context.sessionId),
      context.mode === "auth" && context.profile.company_id
        ? getCompanyIncidentReports(context.profile.company_id)
        : getDemoIncidentReports(context.sessionId)
    ]);

    const weekStart = weekStartIso();
    const allReports = [
      ...shiftReports.map((report) => ({ ...report, type: "shift" as const })),
      ...incidentReports.map((report) => ({ ...report, type: "incident" as const }))
    ];
    const staffMap = new Map<string, { totalReports: number; lateReports: number; incidentReports: number }>();

    for (const report of allReports) {
      const staffName = report.staff_name || "Unknown staff";
      const current = staffMap.get(staffName) ?? {
        totalReports: 0,
        lateReports: 0,
        incidentReports: 0
      };
      current.totalReports += 1;
      current.lateReports += isLateReport(report) ? 1 : 0;
      current.incidentReports += report.type === "incident" || Boolean("incident_flag" in report && report.incident_flag) ? 1 : 0;
      staffMap.set(staffName, current);
    }

    return NextResponse.json({
      totalReportsThisWeek: allReports.filter((report) => (report.created_at || "") >= weekStart).length,
      draftReports: allReports.filter((report) => normalizeStatus(report) === "draft").length,
      lateReports: allReports.filter(isLateReport).length,
      incidentReports:
        incidentReports.length + shiftReports.filter((report) => report.incident_flag).length,
      reportsNeedingReview: allReports.filter((report) =>
        ["submitted", "completed", "late"].includes(normalizeStatus(report))
      ).length,
      medicationIssues: shiftReports.filter((report) => report.medication_issue_flag).length,
      lineOfSightIssues: allReports.filter((report) => report.line_of_sight_issue_flag).length,
      staffCompliance: Array.from(staffMap.entries()).map(([staffName, values]) => ({
        staffName,
        ...values
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load admin metrics." },
      { status: 500 }
    );
  }
}
