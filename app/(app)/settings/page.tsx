import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getRoleLabel } from "@/lib/auth/roles";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Account, privacy requests, data export, and account deletion readiness.
      </p>
      {!profile ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo mode is active. Log in with a real Supabase account before entering any real participant data.
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
