import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LegalAcceptanceButton } from "@/components/legal/legal-acceptance-button";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getRoleLabel } from "@/lib/auth/roles";
import {
  getLatestLegalAcceptance,
  getPolicyVersionSummary,
  hasCurrentLegalAcceptance,
  legalPolicyVersions
} from "@/lib/legal/policies";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  const legalAcceptance = profile ? await getLatestLegalAcceptance(profile.id) : null;
  const legalIsCurrent = profile ? await hasCurrentLegalAcceptance(profile.id) : false;

  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Account, privacy requests, data export, and account deletion readiness.
      </p>
      {!profile ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo mode is active. Log in with a real Supabase account before entering any real workplace or personal data.
        </div>
      ) : null}
      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <input className="h-11 rounded-md border px-3" readOnly value={profile?.full_name || ""} placeholder="Full name" />
          <input className="h-11 rounded-md border px-3" readOnly value={profile?.email || ""} placeholder="Email" />
          <input className="h-11 rounded-md border px-3" readOnly value={profile ? getRoleLabel(profile.role) : "Demo mode"} placeholder="Role" />
          <input className="h-11 rounded-md border px-3" readOnly value={profile?.company?.name || "Demo workspace"} placeholder="Company" />
        </CardContent>
      </Card>

      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Legal acceptance</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <p>Terms accepted: {formatDate(legalAcceptance?.accepted_terms_at)}</p>
          <p>Privacy accepted: {formatDate(legalAcceptance?.accepted_privacy_at)}</p>
          <p>Data handling accepted: {formatDate(legalAcceptance?.accepted_data_handling_at)}</p>
          <p>AI disclaimer accepted: {formatDate(legalAcceptance?.accepted_ai_disclaimer_at)}</p>
          <p className="rounded-md bg-muted p-3">
            Current policy version: {getPolicyVersionSummary()}
          </p>
          {profile && !legalIsCurrent ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
              <p className="mb-3">
                You need to accept the current legal policies before creating new reports.
              </p>
              <LegalAcceptanceButton />
            </div>
          ) : null}
          {legalAcceptance ? (
            <p className="text-xs">
              Accepted versions: Terms {legalAcceptance.accepted_terms_version || "Not recorded"}, Privacy{" "}
              {legalAcceptance.accepted_privacy_version || "Not recorded"}, Data Handling{" "}
              {legalAcceptance.accepted_data_handling_version || "Not recorded"}, AI Disclaimer{" "}
              {legalAcceptance.accepted_ai_disclaimer_version || "Not recorded"}
            </p>
          ) : (
            <p className="text-xs">
              No legal acceptance record found for this account. Current required versions are Terms{" "}
              {legalPolicyVersions.terms}, Privacy {legalPolicyVersions.privacy}, Data Handling{" "}
              {legalPolicyVersions.data_handling}, and AI Disclaimer {legalPolicyVersions.ai_disclaimer}.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Export my data</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Prepared placeholder for exporting user reports, comments, billing records, and account data.</p>
            <Button variant="outline" disabled>Export request placeholder</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Delete account</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Prepared placeholder for account deletion requests. Production deletion will require identity confirmation and audit retention policy review.</p>
            <Button variant="outline" disabled>Delete request placeholder</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security status</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Secrets stay server-side.</p>
            <p>Real Supabase Auth is connected. Keep using fake data until RLS has a final production review.</p>
            <p>Audit logs are written for report create, edit, submit, complete, and review actions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-AU", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
