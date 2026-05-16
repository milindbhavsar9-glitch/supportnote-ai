import { ok } from "@/lib/http";

export async function GET() {
  return ok({ aiGenerationsUsed: 0, aiGenerationsLimit: 3 });
}
