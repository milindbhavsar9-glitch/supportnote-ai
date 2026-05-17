import type { User } from "@supabase/supabase-js";
import { getSupabaseAdmin, getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, AuthProfile } from "@/lib/auth/roles";

type BootstrapInput = {
  user: User;
  fullName: string;
  accountType: "solo" | "team";
  companyName?: string;
};

export async function getCurrentAuthUser() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const user = await getCurrentAuthUser();
  if (!user) return null;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id, email, full_name, role, company_id, companies(id, name, plan)")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  const companyRelation = data.companies as
    | { id: string; name: string; plan: string | null }
    | { id: string; name: string; plan: string | null }[]
    | null;
  const company = Array.isArray(companyRelation) ? companyRelation[0] ?? null : companyRelation;

  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role as AppRole,
    company_id: data.company_id,
    company
  };
}

export async function bootstrapUserProfile(input: BootstrapInput) {
  const supabase = getSupabaseAdmin();
  const role: AppRole = input.accountType === "team" ? "company_admin" : "solo_user";
  const email = input.user.email ?? "";
  const fullName = input.fullName.trim() || email;
  const companyName =
    input.accountType === "team"
      ? input.companyName?.trim() || `${fullName}'s Support Team`
      : `${fullName}'s Workspace`;

  const existing = await supabase
    .from("users")
    .select("id, company_id")
    .eq("id", input.user.id)
    .maybeSingle();

  if (existing.data?.id) return existing.data;

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      business_name: input.accountType === "team" ? companyName : null,
      contact_email: email,
      billing_email: email,
      plan: "free_trial"
    })
    .select("id")
    .single();

  if (companyError) throw new Error(companyError.message);

  const { error: userError } = await supabase.from("users").insert({
    id: input.user.id,
    email,
    full_name: fullName,
    role,
    company_id: company.id
  });

  if (userError) throw new Error(userError.message);

  const { error: companyUpdateError } = await supabase
    .from("companies")
    .update({ created_by: input.user.id })
    .eq("id", company.id);

  if (companyUpdateError) throw new Error(companyUpdateError.message);

  const { error: memberError } = await supabase.from("company_members").insert({
    company_id: company.id,
    user_id: input.user.id,
    role,
    status: "active",
    joined_at: new Date().toISOString()
  });

  if (memberError) throw new Error(memberError.message);

  const trialStart = new Date();
  const trialEnd = new Date(trialStart);
  trialEnd.setDate(trialEnd.getDate() + 7);

  await supabase.from("subscriptions").insert({
    company_id: company.id,
    user_id: input.user.id,
    plan: "free_trial",
    status: "trialing",
    trial_start: trialStart.toISOString(),
    trial_end: trialEnd.toISOString()
  });

  return { id: input.user.id, company_id: company.id };
}
