import { DEMO_AI_GENERATION_LIMIT } from "@/lib/ai/options";
import { ok } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const sessionId = request.headers.get("x-supportnote-session");

  if (!sessionId || sessionId.length < 8) {
    return ok({
      aiGenerationsUsed: 0,
      aiGenerationsLimit: DEMO_AI_GENERATION_LIMIT
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("ai_generation_logs")
      .select("id", { count: "exact", head: true })
      .like("ai_action", `demo:${sessionId}:%`);

    if (error) throw new Error(error.message);

    return ok({
      aiGenerationsUsed: count ?? 0,
      aiGenerationsLimit: DEMO_AI_GENERATION_LIMIT
    });
  } catch {
    return ok({
      aiGenerationsUsed: 0,
      aiGenerationsLimit: DEMO_AI_GENERATION_LIMIT
    });
  }
}
