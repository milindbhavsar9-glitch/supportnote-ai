import type Stripe from "stripe";
import { plans, type PlanId } from "@/lib/config/plans";
import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type SubscriptionStatus = {
  plan: PlanId;
  planName: string;
  status: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    users: number;
    shiftReports: number | null;
    incidentReports: number | null;
    aiGenerations: number;
    trialDays?: number;
  };
  usage: {
    shiftReportsUsed: number;
    incidentReportsUsed: number;
    aiGenerationsUsed: number;
  };
};

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

function getPlan(planId: PlanId) {
  return plans.find((plan) => plan.id === planId);
}

export function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

function defaultStatus(): SubscriptionStatus {
  const plan = getPlan("free_trial")!;
  return {
    plan: plan.id,
    planName: plan.name,
    status: "trialing",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    limits: plan.limits,
    usage: {
      shiftReportsUsed: 0,
      incidentReportsUsed: 0,
      aiGenerationsUsed: 0
    }
  };
}

async function getReportUsage(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { start, end } = getCurrentMonthRange();

  const [shiftResult, incidentResult, aiResult] = await Promise.all([
    supabase
      .from("shift_reports")
      .select("id", { count: "exact", head: true })
      .contains("form_data", { client_session_id: sessionId })
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("incident_reports")
      .select("id", { count: "exact", head: true })
      .contains("form_data", { client_session_id: sessionId })
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString()),
    supabase
      .from("ai_generation_logs")
      .select("id", { count: "exact", head: true })
      .like("ai_action", `demo:${sessionId}:%`)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString())
  ]);

  return {
    shiftReportsUsed: shiftResult.count ?? 0,
    incidentReportsUsed: incidentResult.count ?? 0,
    aiGenerationsUsed: aiResult.count ?? 0
  };
}

async function findCustomerForSession(sessionId: string) {
  try {
    const stripe = getStripe();
    const customers = await stripe.customers.search({
      query: `metadata['client_session_id']:'${sessionId.replaceAll("'", "")}'`,
      limit: 1
    });

    return customers.data[0] ?? null;
  } catch {
    return null;
  }
}

function planFromSubscription(subscription: Stripe.Subscription): PlanId {
  const metadataPlan = subscription.metadata.plan_id;
  if (metadataPlan === "solo_worker" || metadataPlan === "small_team") return metadataPlan;
  return subscription.items.data[0]?.price?.unit_amount === 4900 ? "small_team" : "solo_worker";
}

export async function getSubscriptionStatusForSession(sessionId: string): Promise<SubscriptionStatus> {
  const status = defaultStatus();
  status.usage = await getReportUsage(sessionId);

  const customer = await findCustomerForSession(sessionId);
  if (!customer) return status;

  try {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 10
    });
    const subscription =
      subscriptions.data.find((item) => ACTIVE_STATUSES.has(item.status)) ?? subscriptions.data[0];

    if (!subscription) {
      return {
        ...status,
        stripeCustomerId: customer.id,
        status: "no_subscription"
      };
    }

    const plan = getPlan(planFromSubscription(subscription)) ?? getPlan("free_trial")!;

    return {
      plan: plan.id,
      planName: plan.name,
      status: subscription.status,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      limits: plan.limits,
      usage: status.usage
    };
  } catch {
    return {
      ...status,
      stripeCustomerId: customer.id
    };
  }
}

export function isLimitReached({
  used,
  limit
}: {
  used: number;
  limit: number | null;
}) {
  return typeof limit === "number" && used >= limit;
}
