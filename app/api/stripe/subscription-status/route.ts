import { NextResponse } from "next/server";
import { getSubscriptionStatusForSession } from "@/lib/billing/subscription";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  try {
    return NextResponse.json(await getSubscriptionStatusForSession(sessionId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load subscription status." },
      { status: 500 }
    );
  }
}
