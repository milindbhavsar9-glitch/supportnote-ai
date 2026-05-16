"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_ADMIN_STORAGE_KEY, type DemoAdminUser } from "@/lib/auth/demo-admin";

export function DemoUserBadge() {
  const router = useRouter();
  const [user, setUser] = useState<DemoAdminUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(DEMO_ADMIN_STORAGE_KEY);
    if (!stored) return;

    try {
      setUser(JSON.parse(stored) as DemoAdminUser);
    } catch {
      window.localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
    }
  }, []);

  function logout() {
    window.localStorage.removeItem(DEMO_ADMIN_STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm">
        <a href="/login">Log in</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right text-xs sm:block">
        <p className="font-semibold text-foreground">{user.name}</p>
        <p className="text-muted-foreground">{user.role}</p>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </div>
  );
}
