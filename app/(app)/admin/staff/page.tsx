import { AdminDirectoryManager } from "@/components/admin/admin-directory-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canOpenAdmin } from "@/lib/auth/roles";

export default async function AdminStaffPage() {
  const profile = await getCurrentProfile();
  if (profile && !canOpenAdmin(profile.role)) {
    return (
      <Card>
        <CardHeader><CardTitle>Admin access required</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Staff management is available to team leaders and company admins.
        </CardContent>
      </Card>
    );
  }

  return <AdminDirectoryManager mode="staff" />;
}
