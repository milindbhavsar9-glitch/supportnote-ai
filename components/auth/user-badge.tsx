import Link from "next/link";
import { LogoutButton } from "@/components/auth/auth-forms";
import { DemoUserBadge } from "@/components/auth/demo-user-badge";
import type { AuthProfile } from "@/lib/auth/roles";
import { getRoleLabel } from "@/lib/auth/roles";

export function UserBadge({ profile }: { profile: AuthProfile | null }) {
  if (!profile) return <DemoUserBadge />;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-foreground">{profile.full_name || profile.email}</p>
        <p className="text-xs text-muted-foreground">
          {getRoleLabel(profile.role)}
          {profile.company?.name ? ` · ${profile.company.name}` : ""}
        </p>
      </div>
      <Link href="/settings" className="text-sm font-semibold text-primary sm:hidden">
        Account
      </Link>
      <LogoutButton />
    </div>
  );
}
