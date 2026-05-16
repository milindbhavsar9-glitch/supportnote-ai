import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const reviewSchema = z.object({
  reportType: z.enum(["shift", "incident"])
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Report type is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const table = parsed.data.reportType === "shift" ? "shift_reports" : "incident_reports";
    const { data, error } = await supabase
      .from(table)
      .update({
        status: "reviewed",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .contains("form_data", { client_session_id: sessionId })
      .select("id, status")
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("report_audit_logs").insert({
      report_id: id,
      report_type: parsed.data.reportType,
      action: "reviewed",
      new_status: "reviewed",
      metadata: { client_session_id: sessionId }
    });

    return NextResponse.json({ report: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not mark report as reviewed." },
      { status: 500 }
    );
  }
}
