import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const commentSchema = z.object({
  reportType: z.enum(["shift", "incident"]),
  comment: z.string().min(1).max(2000)
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const table = parsed.data.reportType === "shift" ? "shift_reports" : "incident_reports";
    const existing = await supabase
      .from(table)
      .select("id")
      .eq("id", id)
      .contains("form_data", { client_session_id: sessionId })
      .maybeSingle();

    if (!existing.data?.id) {
      return NextResponse.json({ error: "Report not found for this demo session." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("report_comments")
      .insert({
        report_id: id,
        report_type: parsed.data.reportType,
        comment: parsed.data.comment
      })
      .select("id, comment, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ comment: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not add comment." },
      { status: 500 }
    );
  }
}
