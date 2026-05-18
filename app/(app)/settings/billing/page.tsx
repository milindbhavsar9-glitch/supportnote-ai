import { SubscriptionManager } from "@/components/billing/subscription-manager";
import { isBillingEnabled } from "@/lib/config/billing";

export default function BillingPage() {
  const billingEnabled = isBillingEnabled();

  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">
        {billingEnabled ? "Subscription Status" : "Internal Testing Access"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {billingEnabled
          ? "Manage checkout, plan limits, invoices, upgrades, and cancellation through Stripe Billing."
          : "Billing is currently disabled. All signed-in users have full access for private company testing."}
      </p>
      <div className="mt-6">
        <SubscriptionManager />
      </div>
    </div>
  );
}
