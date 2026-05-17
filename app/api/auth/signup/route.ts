import { NextResponse } from "next/server";
import { z } from "zod";
import { bootstrapUserProfile } from "@/lib/auth/profile";
import { recordLegalAcceptance } from "@/lib/legal/policies";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  accountType: z.enum(["solo", "team"]),
  companyName: z.string().optional().default(""),
  legalAccepted: z.boolean().refine(Boolean, {
    message: "You must agree to the Terms, Privacy Policy, Data Handling Notice, and AI Disclaimer before creating an account."
  })
});

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Check your details." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        full_name: parsed.data.fullName,
        account_type: parsed.data.accountType,
        company_name: parsed.data.companyName
      }
    }
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Could not create your account." },
      { status: 400 }
    );
  }

  await bootstrapUserProfile({
    user: data.user,
    fullName: parsed.data.fullName,
    accountType: parsed.data.accountType,
    companyName: parsed.data.companyName
  });

  await recordLegalAcceptance({
    userId: data.user.id,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null,
    userAgent: request.headers.get("user-agent")
  });

  return NextResponse.json({
    ok: true,
    needsEmailConfirmation: !data.session,
    message: data.session
      ? "Account created. Opening your dashboard."
      : "Account created. Check your email to confirm your login."
  });
}
