"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DEMO_ADMIN_STORAGE_KEY,
  demoAdminAccounts,
  validateDemoAdminLogin
} from "@/lib/auth/demo-admin";

export function DemoLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function login() {
    const account = validateDemoAdminLogin(email, password);

    if (!account) {
      setMessage("Email or password is incorrect.");
      return;
    }

    window.localStorage.setItem(
      DEMO_ADMIN_STORAGE_KEY,
      JSON.stringify({
        email: account.email,
        name: account.name,
        role: account.role
      })
    );

    router.push("/admin");
  }

  function fillDemo(emailValue: string, passwordValue: string) {
    setEmail(emailValue);
    setPassword(passwordValue);
    setMessage("");
  }

  return (
    <div className="mt-6 space-y-4">
      <input
        className="h-11 w-full rounded-md border px-3"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        className="h-11 w-full rounded-md border px-3"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") login();
        }}
      />
      <Button className="w-full" type="button" onClick={login}>
        Log in
      </Button>

      <div className="rounded-md border bg-muted/60 p-3 text-sm">
        <p className="font-semibold">Demo admin accounts</p>
        <div className="mt-2 space-y-2">
          {demoAdminAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email, account.password)}
              className="block w-full rounded-md bg-white px-3 py-2 text-left hover:bg-secondary"
            >
              <span className="font-medium">{account.email}</span>
              <span className="text-muted-foreground"> / {account.password}</span>
            </button>
          ))}
        </div>
      </div>

      {message ? <p className="text-sm font-medium text-red-700">{message}</p> : null}
    </div>
  );
}
