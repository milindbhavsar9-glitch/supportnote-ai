import OpenAI from "openai";
import { z } from "zod";
import { supportNoteSystemInstruction } from "@/lib/ai/instructions";
import {
  AI_REVIEW_DISCLAIMER,
  getAIWritingOption
} from "@/lib/ai/options";
import { getSubscriptionStatusForSession } from "@/lib/billing/subscription";
import { isBillingEnabled } from "@/lib/config/billing";
import { ok } from "@/lib/http";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const requestSchema = z.object({
  reportType: z.enum(["shift", "incident"]),
  action: z.string().min(1),
  sourceText: z.string().min(20, "Add more report details before using AI."),
  clientSessionId: z.string().min(8),
  reportId: z.string().uuid().optional()
});

function demoActionPrefix(sessionId: string) {
  return `demo:${sessionId}:`;
}

function buildUserPrompt({
  reportType,
  optionPrompt,
  sourceText
}: {
  reportType: "shift" | "incident";
  optionPrompt: string;
  sourceText: string;
}) {
  return `Report type: ${reportType}

Task:
${optionPrompt}

Important:
- Do not invent missing information.
- Use simple English suitable for workplace reports.
- Keep names, dates, times, observations, notifications, and follow-up details factual.
- If the information suggests a missing person, unknown location, visibility concern, safety incident, injury, aggression, task/procedure error, policy breach, or other serious risk, include a short reminder to notify the appropriate manager or supervisor and follow workplace policies and legal obligations.

Report details:
${sourceText}`;
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.safeParse(await request.json());

    if (!body.success) {
      return ok({ error: body.error.errors[0]?.message || "Invalid AI request." }, { status: 400 });
    }

    const option = getAIWritingOption(body.data.action);
    if (!option) {
      return ok({ error: "Unknown AI writing option." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return ok(
        {
          error:
            "OPENAI_API_KEY is not configured in Vercel yet. Add your OpenAI API key, redeploy, then try AI Help Me Write again."
        },
        { status: 503 }
      );
    }

    const subscription = await getSubscriptionStatusForSession(body.data.clientSessionId);
    const usedBefore = subscription.usage.aiGenerationsUsed;
    const limit = subscription.limits.aiGenerations;

    if (isBillingEnabled() && usedBefore >= limit) {
      return ok(
        {
          error: `Your ${subscription.planName} AI generation limit has been reached.`,
          usage: {
            aiGenerationsUsed: usedBefore,
            aiGenerationsLimit: limit
          }
        },
        { status: 429 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: supportNoteSystemInstruction },
        {
          role: "user",
          content: buildUserPrompt({
            reportType: body.data.reportType,
            optionPrompt: option.prompt,
            sourceText: body.data.sourceText
          })
        }
      ]
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return ok({ error: "AI did not return text. Please try again." }, { status: 502 });
    }

    const supabase = getSupabaseAdmin();
    const { error: logError } = await supabase.from("ai_generation_logs").insert({
      user_id: null,
      company_id: null,
      report_type: body.data.reportType,
      report_id: body.data.reportId || null,
      ai_action: `${demoActionPrefix(body.data.clientSessionId)}${body.data.action}`,
      model,
      input_tokens: completion.usage?.prompt_tokens ?? null,
      output_tokens: completion.usage?.completion_tokens ?? null
    });

    if (logError) {
      throw new Error(logError.message);
    }

    const usedAfter = usedBefore + 1;

    return ok({
      text,
      disclaimer: AI_REVIEW_DISCLAIMER,
      usage: {
        aiGenerationsUsed: usedAfter,
        aiGenerationsLimit: limit
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI helper failed.";
    return ok({ error: message }, { status: 500 });
  }
}
