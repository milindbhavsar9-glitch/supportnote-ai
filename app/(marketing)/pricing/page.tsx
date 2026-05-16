import { PricingCard } from "@/components/pricing/pricing-card";
import { plans } from "@/lib/config/plans";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Simple plans for workers and small teams.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start with a 7 day free trial, then choose a solo or team subscription.
          Plan limits are enforced server-side and can be configured from app settings.
        </p>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </main>
  );
}
