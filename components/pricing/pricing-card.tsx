import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanLimit } from "@/lib/config/plans";

export function PricingCard({ plan }: { plan: PlanLimit }) {
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
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-6 w-full" variant={plan.id === "small_team" ? "accent" : "default"}>
          {plan.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
