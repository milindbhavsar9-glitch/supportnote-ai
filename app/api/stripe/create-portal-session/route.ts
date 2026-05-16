import { NextResponse } from "next/server";
import { getSubscriptionStatusForSession } from "@/lib/billing/subscription";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getStripe } from "@/lib/stripe/server";

function getAppUrl() {
  const fallback = "https://supportnote-ai.vercel.app";
  const value = process.env.NEXT_PUBLIC_APP_URL || fallback;

  try {
    return new URL(value).origin;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  try {
    const status = await getSubscriptionStatusForSession(sessionId);
    if (!status.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found yet. Start a paid plan first." },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: status.stripeCustomerId,
      return_url: `${getAppUrl()}/settings/billing`
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not open Stripe customer portal." },
      { status: 500 }
    );
  }
}
