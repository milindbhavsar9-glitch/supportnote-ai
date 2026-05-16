import type Stripe from "stripe";
import { plans, type PlanId } from "@/lib/config/plans";

export type BillingPlanId = Exclude<PlanId, "free_trial">;

const priceEnv: Record<BillingPlanId, string | undefined> = {
  solo_worker: process.env.STRIPE_SOLO_WORKER_PRICE_ID,
  small_team: process.env.STRIPE_SMALL_TEAM_PRICE_ID
};

const fallbackPriceData: Record<BillingPlanId, Stripe.Checkout.SessionCreateParams.LineItem.PriceData> = {
  solo_worker: {
    currency: "aud",
    unit_amount: 1299,
    recurring: { interval: "month" },
    product_data: {
      name: "SupportNote AI Solo Worker Plan",
      description: "1 user, report saving, PDF export, search records, and AI writing support."
    }
  },
  small_team: {
    currency: "aud",
    unit_amount: 4900,
    recurring: { interval: "month" },
    product_data: {
      name: "SupportNote AI Small Team Plan",
      description: "Up to 5 staff users, admin dashboard, review workflow, and higher AI limits."
    }
  }
};

export function getPlan(planId: PlanId) {
  return plans.find((plan) => plan.id === planId);
}

export function isPaidPlan(planId: string): planId is BillingPlanId {
  return planId === "solo_worker" || planId === "small_team";
}

export function getCheckoutLineItem(planId: BillingPlanId): Stripe.Checkout.SessionCreateParams.LineItem {
  const price = priceEnv[planId];

  if (price) {
    return { price, quantity: 1 };
  }

  return {
    price_data: fallbackPriceData[planId],
    quantity: 1
  };
}

export function getPlanFromStripePriceId(priceId?: string | null): PlanId {
  if (priceId && priceId === process.env.STRIPE_SMALL_TEAM_PRICE_ID) return "small_team";
  if (priceId && priceId === process.env.STRIPE_SOLO_WORKER_PRICE_ID) return "solo_worker";
  return "solo_worker";
}
