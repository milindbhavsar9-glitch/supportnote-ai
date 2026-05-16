import { DEMO_AI_GENERATION_LIMIT } from "@/lib/ai/options";
import { getSubscriptionStatusForSession } from "@/lib/billing/subscription";
import { ok } from "@/lib/http";

export async function GET(request: Request) {
  const sessionId = request.headers.get("x-supportnote-session");

  if (!sessionId || sessionId.length < 8) {
    return ok({
      aiGenerationsUsed: 0,
      aiGenerationsLimit: DEMO_AI_GENERATION_LIMIT
    });
  }

  try {
    const subscription = await getSubscriptionStatusForSession(sessionId);

    return ok({
      aiGenerationsUsed: subscription.usage.aiGenerationsUsed,
      aiGenerationsLimit: subscription.limits.aiGenerations
    });
  } catch {
    return ok({
      aiGenerationsUsed: 0,
      aiGenerationsLimit: DEMO_AI_GENERATION_LIMIT
    });
  }
}
