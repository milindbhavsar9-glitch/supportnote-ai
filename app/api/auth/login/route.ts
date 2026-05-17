import { NextResponse } from "next/server";
import { z } from "zod";
import { bootstrapUserProfile } from "@/lib/auth/profile";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Could not log in. Check your details and try again." },
      { status: 401 }
    );
  }

  await bootstrapUserProfile({
    user: data.user,
    fullName: data.user.user_metadata?.full_name || data.user.email || "SupportNote user",
    accountType: data.user.user_metadata?.account_type === "team" ? "team" : "solo",
    companyName: data.user.user_metadata?.company_name
  });

  return NextResponse.json({ ok: true });
}
