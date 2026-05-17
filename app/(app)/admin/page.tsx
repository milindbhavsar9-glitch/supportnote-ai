import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canOpenAdmin } from "@/lib/auth/roles";

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (profile && !canOpenAdmin(profile.role)) {
    return (
      <Card>
        <CardHeader><CardTitle>Admin access required</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ask a company admin to change your role if you need to review team reports.
        </CardContent>
      </Card>
    );
  }

  return <AdminDashboard />;
}
