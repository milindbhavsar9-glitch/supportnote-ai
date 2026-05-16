import { NextResponse } from "next/server";
import {
  getClientSessionId,
  getIncidentReportSelect,
  getReportSelect,
  missingSessionResponse
} from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { searchParams } = new URL(request.url);
  const participant = searchParams.get("participant")?.trim();
  const staff = searchParams.get("staff")?.trim();
  const status = searchParams.get("status")?.trim();
  const reportType = searchParams.get("report_type")?.trim();
  const incident = searchParams.get("incident") === "true";
  const medication = searchParams.get("medication") === "true";
  const lineOfSight = searchParams.get("line_of_sight") === "true";

  const supabase = getSupabaseAdmin();
  const searches: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>[] = [];

  if (!reportType || reportType === "shift") {
    let shiftQuery = supabase
      .from("shift_reports")
      .select(getReportSelect())
      .contains("form_data", { client_session_id: sessionId })
      .order("updated_at", { ascending: false })
      .limit(50);

    if (participant) shiftQuery = shiftQuery.ilike("participant_name", `%${participant}%`);
    if (staff) shiftQuery = shiftQuery.ilike("staff_name", `%${staff}%`);
    if (status) shiftQuery = shiftQuery.eq("status", status);
    if (incident) shiftQuery = shiftQuery.eq("incident_flag", true);
    if (medication) shiftQuery = shiftQuery.eq("medication_issue_flag", true);
    if (lineOfSight) shiftQuery = shiftQuery.eq("line_of_sight_issue_flag", true);

    searches.push(shiftQuery.then((result) => ({
      data: (result.data ?? []).map((row) => ({ ...(row as object), report_type: "shift" })),
      error: result.error
    })));
  }

  if (!reportType || reportType === "incident") {
    let incidentQuery = supabase
      .from("incident_reports")
      .select(getIncidentReportSelect())
      .contains("form_data", { client_session_id: sessionId })
      .order("updated_at", { ascending: false })
      .limit(50);

    if (participant) incidentQuery = incidentQuery.ilike("participant_name", `%${participant}%`);
    if (staff) incidentQuery = incidentQuery.ilike("staff_name", `%${staff}%`);
    if (status) incidentQuery = incidentQuery.eq("status", status);
    if (incident) incidentQuery = incidentQuery.not("incident_type", "is", null);
    if (lineOfSight) incidentQuery = incidentQuery.eq("line_of_sight_issue_flag", true);

    searches.push(incidentQuery.then((result) => ({
      data: (result.data ?? []).map((row) => ({
        ...(row as object),
        report_type: "incident",
        report_date: (row as { incident_date?: string }).incident_date,
        incident_flag: true,
        medication_issue_flag: (row as { incident_type?: string }).incident_type === "Medication error",
        behaviour_issue_flag: ["Physical aggression", "Verbal threat", "Property damage"].includes(
          (row as { incident_type?: string }).incident_type ?? ""
        )
      })),
      error: result.error
    })));
  }

  const results = await Promise.all(searches);
  const error = results.find((result) => result.error)?.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reports = results
    .flatMap((result) => result.data ?? [])
    .sort((a, b) => {
      const left = new Date((a as { updated_at: string }).updated_at).getTime();
      const right = new Date((b as { updated_at: string }).updated_at).getTime();
      return right - left;
    });

  return NextResponse.json({ reports });
}
