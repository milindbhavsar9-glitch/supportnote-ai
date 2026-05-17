import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import { getReportSelect, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestContext = await getRequestContext(request);
  if (!requestContext) return missingSessionResponse();

  const supabase = getSupabaseAdmin();
  let query = supabase.from("shift_reports").select(getReportSelect());
  if (requestContext.mode === "demo") {
    query = query.contains("form_data", { client_session_id: requestContext.sessionId });
  } else if (
    requestContext.profile.company_id &&
    (requestContext.profile.role === "team_leader" || requestContext.profile.role === "company_admin")
  ) {
    query = query.eq("company_id", requestContext.profile.company_id);
  } else {
    query = query.eq("user_id", requestContext.profile.id);
  }

  const { data, error } = await query.order("updated_at", { ascending: false }).limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data ?? [] });
}
