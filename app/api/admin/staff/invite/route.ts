import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/auth/request-context";
import { canManageTeam } from "@/lib/auth/roles";
import { missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["support_worker", "team_leader"]).default("support_worker")
});

export async function POST(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();

  if (context.mode !== "auth" || !canManageTeam(context.profile.role) || !context.profile.company_id) {
    return NextResponse.json({ error: "Only company admins can invite staff." }, { status: 403 });
  }

  const parsed = inviteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid staff email and role." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: invitedUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        invited_company_id: context.profile.company_id,
        invited_role: parsed.data.role
      },
      redirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`
    }
  );

  if (inviteError || !invitedUser.user) {
    return NextResponse.json(
      { error: inviteError?.message || "Could not send staff invite." },
      { status: 400 }
    );
  }

  await supabase.from("users").upsert({
    id: invitedUser.user.id,
    email: parsed.data.email,
    role: parsed.data.role,
    company_id: context.profile.company_id,
    is_active: true
  });

  const { error: memberError } = await supabase.from("company_members").upsert({
    company_id: context.profile.company_id,
    user_id: invitedUser.user.id,
    role: parsed.data.role,
    status: "invited",
    invited_by: context.profile.id
  });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Invite sent." });
}
