import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPlanFromStripePriceId } from "@/lib/billing/plans";
import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const handledEvents = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
];

function asString(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function toIso(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

async function storeBillingEvent(event: Stripe.Event, processed = false) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("billing_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: event as unknown as Record<string, unknown>,
    processed
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw new Error(error.message);
  }
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const supabase = getSupabaseAdmin();
  const priceId = subscription.items.data[0]?.price?.id;
  const metadataPlan = subscription.metadata.plan_id;
  const plan =
    metadataPlan === "solo_worker" || metadataPlan === "small_team"
      ? metadataPlan
      : getPlanFromStripePriceId(priceId);

  const payload = {
    stripe_customer_id: asString(subscription.customer),
    stripe_subscription_id: subscription.id,
    plan,
    status: subscription.status,
    current_period_start: toIso(subscription.current_period_start),
    current_period_end: toIso(subscription.current_period_end),
    trial_start: toIso(subscription.trial_start),
    trial_end: toIso(subscription.trial_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString()
  };

  const existing = await supabase
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await supabase
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.data.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("subscriptions").insert(payload);
  if (error) throw new Error(error.message);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  const customerId = asString(session.customer);
  const subscriptionId = asString(session.subscription);

  if (customerId && session.metadata?.client_session_id) {
    await stripe.customers.update(customerId, {
      metadata: {
        client_session_id: session.metadata.client_session_id,
        plan_id: session.metadata.plan_id || ""
      }
    });
  }

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await upsertSubscription(subscription);
  }
}

async function handleInvoiceEvent(invoice: Stripe.Invoice) {
  const subscriptionId = asString(invoice.subscription);
  if (!subscriptionId) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await upsertSubscription(subscription);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook signature or STRIPE_WEBHOOK_SECRET is missing." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Stripe webhook signature." },
      { status: 400 }
    );
  }

  try {
    if (!handledEvents.includes(event.type)) {
      await storeBillingEvent(event, false);
      return NextResponse.json({ received: true, ignored: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await upsertSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        await handleInvoiceEvent(event.data.object as Stripe.Invoice);
        break;
    }

    await storeBillingEvent(event, true);
    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not process Stripe webhook." },
      { status: 500 }
    );
  }
}
