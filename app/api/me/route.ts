import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";

export async function GET() {
  const profile = await getCurrentProfile();
  return NextResponse.json({
    authenticated: Boolean(profile),
    profile
  });
}

export async function PATCH(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "Log in to update your profile." }, { status: 401 });
  }

  const body = (await request.json()) as { fullName?: string; phone?: string };
  const { getSupabaseAdmin } = await import("@/lib/supabase/server");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: body.fullName?.trim() || profile.full_name,
      phone: body.phone?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", profile.id)
    .select("id, email, full_name, phone, role, company_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
