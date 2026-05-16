import { NextResponse } from "next/server";
import {
  getClientSessionId,
  getShiftReportForSession,
  missingSessionResponse
} from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const existing = await getShiftReportForSession(id, sessionId);

  if (existing.error || !existing.data) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const existingReport = existing.data as unknown as { created_at: string };
  const createdAt = new Date(existingReport.created_at);
  const isLate = Date.now() - createdAt.getTime() > 24 * 60 * 60 * 1000;
  const nextStatus = isLate ? "late" : "submitted";

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shift_reports")
    .update({
      status: nextStatus,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ report: data });
}
