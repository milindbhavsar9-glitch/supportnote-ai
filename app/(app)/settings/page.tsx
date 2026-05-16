import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Demo settings for profile, privacy requests, data export, and account deletion readiness.
      </p>
      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <input className="h-11 rounded-md border px-3" placeholder="Full name" />
          <input className="h-11 rounded-md border px-3" placeholder="Email" />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Export my data</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Prepared placeholder for exporting user reports, comments, billing records, and account data once real Supabase Auth is connected.</p>
            <Button variant="outline" disabled>Export coming with real login</Button>
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
            <p>Demo data only until real authentication is connected.</p>
            <p>Audit logs are written for report create, edit, submit, complete, and review actions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
