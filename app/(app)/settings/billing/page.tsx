import { SubscriptionManager } from "@/components/billing/subscription-manager";

export default function BillingPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Subscription Status</h1>
      <p className="mt-2 text-muted-foreground">Manage checkout, plan limits, invoices, upgrades, and cancellation through Stripe Billing.</p>
      <div className="mt-6">
        <SubscriptionManager />
      </div>
    </div>
  );
}
