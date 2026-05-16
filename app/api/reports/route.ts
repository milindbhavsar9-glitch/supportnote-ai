import { NextResponse } from "next/server";
import { getClientSessionId, getReportSelect, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { searchParams } = new URL(request.url);
  const participant = searchParams.get("participant")?.trim();
  const staff = searchParams.get("staff")?.trim();
  const status = searchParams.get("status")?.trim();
  const incident = searchParams.get("incident") === "true";
  const medication = searchParams.get("medication") === "true";
  const lineOfSight = searchParams.get("line_of_sight") === "true";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("shift_reports")
    .select(getReportSelect())
    .contains("form_data", { client_session_id: sessionId })
    .order("updated_at", { ascending: false })
    .limit(50);

  if (participant) query = query.ilike("participant_name", `%${participant}%`);
  if (staff) query = query.ilike("staff_name", `%${staff}%`);
  if (status) query = query.eq("status", status);
  if (incident) query = query.eq("incident_flag", true);
  if (medication) query = query.eq("medication_issue_flag", true);
  if (lineOfSight) query = query.eq("line_of_sight_issue_flag", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
