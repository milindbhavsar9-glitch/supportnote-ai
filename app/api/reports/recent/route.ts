import { NextResponse } from "next/server";
import { getClientSessionId, getReportSelect, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shift_reports")
    .select(getReportSelect())
    .contains("form_data", { client_session_id: sessionId })
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
