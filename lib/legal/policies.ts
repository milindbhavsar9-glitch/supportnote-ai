import { getSupabaseAdmin } from "@/lib/supabase/server";

export const legalPolicyVersions = {
  terms: "2026-05-17",
  privacy: "2026-05-17",
  data_handling: "2026-05-17",
  ai_disclaimer: "2026-05-17"
} as const;

export type LegalPolicyType = keyof typeof legalPolicyVersions;

export type LegalAcceptance = {
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
  accepted_data_handling_at: string | null;
  accepted_ai_disclaimer_at: string | null;
  accepted_terms_version: string | null;
  accepted_privacy_version: string | null;
  accepted_data_handling_version: string | null;
  accepted_ai_disclaimer_version: string | null;
};

export function getPolicyVersionSummary() {
  return `Terms ${legalPolicyVersions.terms}, Privacy ${legalPolicyVersions.privacy}, Data Handling ${legalPolicyVersions.data_handling}, AI Disclaimer ${legalPolicyVersions.ai_disclaimer}`;
}

export async function recordLegalAcceptance(input: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("user_legal_acceptances").insert({
    user_id: input.userId,
    accepted_terms_at: now,
    accepted_privacy_at: now,
    accepted_data_handling_at: now,
    accepted_ai_disclaimer_at: now,
    accepted_terms_version: legalPolicyVersions.terms,
    accepted_privacy_version: legalPolicyVersions.privacy,
    accepted_data_handling_version: legalPolicyVersions.data_handling,
    accepted_ai_disclaimer_version: legalPolicyVersions.ai_disclaimer,
    ip_address: input.ipAddress || null,
    user_agent: input.userAgent || null
  });

  if (error) throw new Error(error.message);
}

export async function getLatestLegalAcceptance(userId: string): Promise<LegalAcceptance | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_legal_acceptances")
    .select(
      "accepted_terms_at, accepted_privacy_at, accepted_data_handling_at, accepted_ai_disclaimer_at, accepted_terms_version, accepted_privacy_version, accepted_data_handling_version, accepted_ai_disclaimer_version"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function hasCurrentLegalAcceptance(userId: string) {
  const acceptance = await getLatestLegalAcceptance(userId);
  if (!acceptance) return false;

  return (
    acceptance.accepted_terms_version === legalPolicyVersions.terms &&
    acceptance.accepted_privacy_version === legalPolicyVersions.privacy &&
    acceptance.accepted_data_handling_version === legalPolicyVersions.data_handling &&
    acceptance.accepted_ai_disclaimer_version === legalPolicyVersions.ai_disclaimer
  );
}
