import Link from "next/link";
import { BarChart3, ClipboardCheck, FileText, Search, Settings, Users } from "lucide-react";
import { UserBadge } from "@/components/auth/user-badge";
import { getCurrentProfile } from "@/lib/auth/profile";
import { canOpenAdmin } from "@/lib/auth/roles";
import { isBillingEnabled, INTERNAL_TESTING_MESSAGE } from "@/lib/config/billing";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/reports/shift/new", label: "Shift Report", icon: ClipboardCheck },
  { href: "/reports/incident/new", label: "Incident Note", icon: FileText },
  { href: "/reports", label: "Search Records", icon: Search },
  { href: "/admin", label: "Admin", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const visibleNav = nav.filter((item) => item.href !== "/admin" || canOpenAdmin(profile?.role));
  const billingEnabled = isBillingEnabled();

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white p-4 lg:block">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
          <ClipboardCheck className="h-6 w-6" />
          <span>SupportNote AI</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary lg:hidden">
              <ClipboardCheck className="h-6 w-6" />
              <span>SupportNote AI</span>
            </Link>
            <p className="hidden text-sm text-muted-foreground lg:block">
              {INTERNAL_TESTING_MESSAGE}
            </p>
            <div className="flex items-center gap-3">
              {billingEnabled ? (
                <Link href="/settings/billing" className="text-sm font-semibold text-primary">
                  Subscription
                </Link>
              ) : null}
              <UserBadge profile={profile} />
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-white p-2 lg:hidden">
          {visibleNav.slice(0, 4).map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 rounded-md p-2 text-xs text-muted-foreground">
              <item.icon className="h-5 w-5" />
              {item.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
