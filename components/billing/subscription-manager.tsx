"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERNAL_TESTING_MESSAGE, isBillingEnabled } from "@/lib/config/billing";
import { plans, type PlanId } from "@/lib/config/plans";
import { getDemoSessionId } from "@/lib/reports/demo-session";

type SubscriptionStatus = {
  plan: PlanId;
  planName: string;
  status: string;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    users: number;
    shiftReports: number | null;
    incidentReports: number | null;
    aiGenerations: number;
  };
  usage: {
    shiftReportsUsed: number;
    incidentReportsUsed: number;
    aiGenerationsUsed: number;
  };
};

function formatLimit(used: number, limit: number | null) {
  return limit === null ? `${used} used / unlimited` : `${used} used / ${limit}`;
}

export function SubscriptionManager() {
  const billingEnabled = isBillingEnabled();
  const [sessionId, setSessionId] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  useEffect(() => {
    setSessionId(getDemoSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    void loadStatus();
    // Load once when the demo session is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function loadStatus() {
    setMessage("");
    const response = await fetch("/api/stripe/subscription-status", {
      headers: { "x-supportnote-session": sessionId }
    });

    const data = (await response.json()) as SubscriptionStatus & { error?: string };
    if (!response.ok) {
      setMessage(data.error || "Could not load subscription status.");
      return;
    }

    setStatus(data);
  }

  async function startCheckout(planId: Exclude<PlanId, "free_trial">) {
    setLoadingAction(planId);
    setMessage("Opening Stripe checkout...");

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": sessionId
      },
      body: JSON.stringify({ planId, email })
    });

    const data = (await response.json()) as { url?: string; error?: string };
    setLoadingAction("");

    if (!response.ok || !data.url) {
      setMessage(data.error || "Could not open Stripe checkout.");
      return;
    }

    window.location.assign(data.url);
  }

  async function openPortal() {
    setLoadingAction("portal");
    setMessage("Opening Stripe customer portal...");

    const response = await fetch("/api/stripe/create-portal-session", {
      method: "POST",
      headers: { "x-supportnote-session": sessionId }
    });

    const data = (await response.json()) as { url?: string; error?: string };
    setLoadingAction("");

    if (!response.ok || !data.url) {
      setMessage(data.error || "No Stripe customer found yet. Start a paid plan first.");
      return;
    }

    window.location.assign(data.url);
  }

  if (!billingEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Billing disabled for testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
          <p>{INTERNAL_TESTING_MESSAGE}</p>
          <p>All signed-in users have full access while private testing mode is active.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Current subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-muted-foreground">Plan</p>
              <p className="mt-1 text-lg font-bold">{status?.planName || "Loading..."}</p>
            </div>
            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="mt-1 text-lg font-bold capitalize">{status?.status || "Loading"}</p>
            </div>
            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-muted-foreground">Shift reports</p>
              <p className="mt-1 font-semibold">
                {status ? formatLimit(status.usage.shiftReportsUsed, status.limits.shiftReports) : "-"}
              </p>
            </div>
            <div className="rounded-md border bg-white p-4">
              <p className="text-sm text-muted-foreground">AI generations</p>
              <p className="mt-1 font-semibold">
                {status ? formatLimit(status.usage.aiGenerationsUsed, status.limits.aiGenerations) : "-"}
              </p>
            </div>
          </div>

          {status?.cancelAtPeriodEnd ? (
            <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              Your plan is set to cancel at the end of the billing period.
            </p>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 flex-1 rounded-md border bg-white px-3 text-base outline-none focus:ring-2 focus:ring-ring"
              placeholder="Email for Stripe checkout receipt"
              type="email"
            />
            <Button variant="outline" onClick={() => void loadStatus()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => void openPortal()}>
              {loadingAction === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Manage / Cancel
            </Button>
          </div>

          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanBillingCard
            key={plan.id}
            plan={plan}
            loadingAction={loadingAction}
            onRefresh={() => void loadStatus()}
            onCheckout={(planId) => void startCheckout(planId)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanBillingCard({
  plan,
  loadingAction,
  onRefresh,
  onCheckout
}: {
  plan: (typeof plans)[number];
  loadingAction: string;
  onRefresh: () => void;
  onCheckout: (planId: Exclude<PlanId, "free_trial">) => void;
}) {
  const paidPlanId =
    plan.id === "solo_worker" || plan.id === "small_team" ? plan.id : null;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <p className="text-3xl font-bold text-primary">{plan.price}</p>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <ul className="space-y-3 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {paidPlanId ? (
          <Button
            className="mt-6 w-full"
            variant={paidPlanId === "small_team" ? "accent" : "default"}
            onClick={() => onCheckout(paidPlanId)}
          >
            {loadingAction === paidPlanId ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {plan.cta}
          </Button>
        ) : (
          <Button className="mt-6 w-full" variant="outline" onClick={onRefresh}>
            Current Demo Trial
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
