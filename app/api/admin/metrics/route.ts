import { ok } from "@/lib/http";

export async function GET() {
  return ok({
    totalReportsThisWeek: 0,
    draftReports: 0,
    lateReports: 0,
    incidentReports: 0,
    reportsNeedingReview: 0,
    medicationIssues: 0,
    lineOfSightIssues: 0
  });
}
