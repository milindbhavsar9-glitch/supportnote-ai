import { NextResponse } from "next/server";
import { z } from "zod";
import { getCheckoutLineItem, isPaidPlan } from "@/lib/billing/plans";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getStripe } from "@/lib/stripe/server";

const checkoutSchema = z.object({
  planId: z.string(),
  email: z.string().email().optional().or(z.literal(""))
});

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://supportnote-ai.vercel.app";
}

export async function POST(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  try {
    const body = checkoutSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
    }

    const planId = body.data.planId;
    if (!isPaidPlan(planId)) {
      return NextResponse.json({ error: "Free Trial does not need Stripe checkout." }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [getCheckoutLineItem(planId)],
      success_url: `${appUrl}/settings/billing?checkout=success`,
      cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
      customer_email: body.data.email || undefined,
      client_reference_id: sessionId,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          client_session_id: sessionId,
          plan_id: planId
        },
        trial_period_days: 7
      },
      metadata: {
        client_session_id: sessionId,
        plan_id: planId
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create Stripe checkout." },
      { status: 500 }
    );
  }
}
