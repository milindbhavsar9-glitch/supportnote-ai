import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { recordLegalAcceptance } from "@/lib/legal/policies";

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Log in to accept current policies." }, { status: 401 });
  }

  await recordLegalAcceptance({
    userId: profile.id,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({ ok: true });
}
