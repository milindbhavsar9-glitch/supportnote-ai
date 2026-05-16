import { ok } from "@/lib/http";

const handledEvents = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed"
];

export async function POST() {
  return ok(
    {
      status: "planned",
      handledEvents
    },
    { status: 202 }
  );
}
