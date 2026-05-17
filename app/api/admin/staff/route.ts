import { NextResponse } from "next/server";
import { z } from "zod";
import { demoReference } from "@/lib/admin/demo-admin";
import { getRequestContext } from "@/lib/auth/request-context";
import { canManageTeam } from "@/lib/auth/roles";
import { missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const staffSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default("Support Worker"),
  email: z.string().optional().default(""),
  phone: z.string().optional().default("")
});

export async function GET(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();

  try {
    const supabase = getSupabaseAdmin();
    if (context.mode === "auth" && context.profile.company_id) {
      const { data, error } = await supabase
        .from("company_members")
        .select("id, role, status, joined_at, created_at, users(id, full_name, email, is_active)")
        .eq("company_id", context.profile.company_id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return NextResponse.json({
        staff: (data ?? []).map((member) => {
          const userRelation = member.users as
            | { full_name: string | null; email: string; is_active: boolean | null }
            | { full_name: string | null; email: string; is_active: boolean | null }[]
            | null;
          const user = Array.isArray(userRelation) ? userRelation[0] ?? null : userRelation;
          return {
            id: member.id,
            display_name: user?.full_name || user?.email || "Invited staff",
            notes: JSON.stringify({
              role: member.role,
              email: user?.email || "",
              status: member.status
            }),
            is_active: Boolean(user?.is_active ?? true),
            created_at: member.created_at
          };
        })
      });
    }

    const { data, error } = await supabase
      .from("participants")
      .select("id, display_name, notes, is_active, created_at")
      .eq("reference_code", demoReference("staff", context.sessionId))
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ staff: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load staff." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();

  const parsed = staffSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Staff name is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    if (context.mode === "auth") {
      if (!canManageTeam(context.profile.role) || !context.profile.company_id) {
        return NextResponse.json({ error: "Only company admins can add staff." }, { status: 403 });
      }

      if (!parsed.data.email) {
        return NextResponse.json({ error: "Email is required to invite real staff." }, { status: 400 });
      }

      const role = parsed.data.role === "Team Leader" ? "team_leader" : "support_worker";
      const invited = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
        data: {
          full_name: parsed.data.name,
          invited_company_id: context.profile.company_id,
          invited_role: role
        },
        redirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard`
      });

      if (invited.error || !invited.data.user) {
        return NextResponse.json(
          { error: invited.error?.message || "Could not send staff invite." },
          { status: 400 }
        );
      }

      await supabase.from("users").upsert({
        id: invited.data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.name,
        role,
        company_id: context.profile.company_id,
        is_active: true
      });

      const { data, error } = await supabase
        .from("company_members")
        .upsert({
          company_id: context.profile.company_id,
          user_id: invited.data.user.id,
          role,
          status: "invited",
          invited_by: context.profile.id
        })
        .select("id, role, status, created_at")
        .single();

      if (error) throw new Error(error.message);
      return NextResponse.json({ staff: data });
    }

    const { data, error } = await supabase
      .from("participants")
      .insert({
        display_name: parsed.data.name,
        reference_code: demoReference("staff", context.sessionId),
        notes: JSON.stringify({
          demo_record_type: "staff",
          role: parsed.data.role,
          email: parsed.data.email,
          phone: parsed.data.phone
        })
      })
      .select("id, display_name, notes, is_active, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ staff: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create staff." },
      { status: 500 }
    );
  }
}
