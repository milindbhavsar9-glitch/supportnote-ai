import { ok } from "@/lib/http";

export async function GET() {
  return ok({ plan: "free_trial", status: "trialing" });
}
