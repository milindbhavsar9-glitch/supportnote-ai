"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INTERNAL_TESTING_MESSAGE, isBillingEnabled } from "@/lib/config/billing";
import { getDemoSessionId } from "@/lib/reports/demo-session";

type Status = {
  planName: string;
  status: string;
  usage: {
    shiftReportsUsed: number;
    incidentReportsUsed: number;
    aiGenerationsUsed: number;
  };
  limits: {
    shiftReports: number | null;
    incidentReports: number | null;
    aiGenerations: number;
  };
};

export function SubscriptionStatusCard() {
  const billingEnabled = isBillingEnabled();
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const sessionId = getDemoSessionId();

    async function loadStatus() {
      const response = await fetch("/api/stripe/subscription-status", {
        headers: { "x-supportnote-session": sessionId }
      });

      if (!response.ok) return;
      setStatus((await response.json()) as Status);
    }

    void loadStatus();
  }, []);

  if (!billingEnabled) {
    return (
      <Card className="mb-8 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-primary" />
            Internal testing mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">Full access is enabled for company testing.</p>
          <p className="mt-1 text-sm text-muted-foreground">{INTERNAL_TESTING_MESSAGE}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletCards className="h-5 w-5 text-primary" />
          Subscription status
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">
            {status ? `${status.planName} - ${status.status}` : "Loading subscription..."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {status
              ? `Shift reports ${status.usage.shiftReportsUsed}/${status.limits.shiftReports ?? "unlimited"}, Incident reports ${status.usage.incidentReportsUsed}/${status.limits.incidentReports ?? "unlimited"}, AI ${status.usage.aiGenerationsUsed}/${status.limits.aiGenerations}`
              : "Checking your demo/free trial usage limits."}
          </p>
        </div>
        <Link href="/settings/billing" className="text-sm font-semibold text-primary">
          Manage billing
        </Link>
      </CardContent>
    </Card>
  );
}
