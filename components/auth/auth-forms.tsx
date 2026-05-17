"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Status = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = (await response.json()) as { error?: string; message?: string; needsEmailConfirmation?: boolean };
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function StatusMessage({ status }: { status: Status }) {
  if (status.type === "idle") return null;

  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        status.type === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-teal-200 bg-teal-50 text-teal-800"
      }`}
    >
      {status.message}
    </p>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  async function submit(formData: FormData) {
    setStatus({ type: "loading", message: "Logging in..." });
    try {
      await postJson("/api/auth/login", {
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || "")
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not log in."
      });
    }
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <input className="h-11 w-full rounded-md border px-3" name="email" placeholder="Email" type="email" required />
      <input className="h-11 w-full rounded-md border px-3" name="password" placeholder="Password" type="password" required />
      <StatusMessage status={status} />
      <Button className="w-full" disabled={status.type === "loading"} type="submit">
        {status.type === "loading" ? "Logging in..." : "Log in"}
      </Button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const [accountType, setAccountType] = useState("solo");

  async function submit(formData: FormData) {
    setStatus({ type: "loading", message: "Creating account..." });
    try {
      const result = await postJson("/api/auth/signup", {
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        accountType,
        companyName: String(formData.get("companyName") || "")
      });

      if (result.needsEmailConfirmation) {
        setStatus({
          type: "success",
          message: result.message || "Check your email to confirm your account."
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not create account."
      });
    }
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <input className="h-11 w-full rounded-md border px-3" name="fullName" placeholder="Full name" required />
      <input className="h-11 w-full rounded-md border px-3" name="email" placeholder="Email" type="email" required />
      <input className="h-11 w-full rounded-md border px-3" name="password" placeholder="Password" type="password" required />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="rounded-md border p-3 text-sm">
          <input
            checked={accountType === "solo"}
            className="mr-2"
            name="accountType"
            onChange={() => setAccountType("solo")}
            type="radio"
            value="solo"
          />
          Solo user
        </label>
        <label className="rounded-md border p-3 text-sm">
          <input
            checked={accountType === "team"}
            className="mr-2"
            name="accountType"
            onChange={() => setAccountType("team")}
            type="radio"
            value="team"
          />
          Company admin
        </label>
      </div>
      {accountType === "team" ? (
        <input className="h-11 w-full rounded-md border px-3" name="companyName" placeholder="Company or team name" />
      ) : null}
      <StatusMessage status={status} />
      <Button className="w-full" disabled={status.type === "loading"} type="submit">
        {status.type === "loading" ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  async function submit(formData: FormData) {
    setStatus({ type: "loading", message: "Sending reset link..." });
    try {
      const result = await postJson("/api/auth/forgot-password", {
        email: String(formData.get("email") || "")
      });
      setStatus({ type: "success", message: result.message || "Reset link sent." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not send reset link."
      });
    }
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <input className="h-11 w-full rounded-md border px-3" name="email" placeholder="Email" type="email" required />
      <StatusMessage status={status} />
      <Button className="w-full" disabled={status.type === "loading"} type="submit">
        {status.type === "loading" ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  async function submit(formData: FormData) {
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setStatus({ type: "loading", message: "Updating password..." });
    try {
      await postJson("/api/auth/reset-password", { password });
      router.push("/login");
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not update password."
      });
    }
  }

  return (
    <form action={submit} className="mt-6 space-y-4">
      <input className="h-11 w-full rounded-md border px-3" name="password" placeholder="New password" type="password" required />
      <input className="h-11 w-full rounded-md border px-3" name="confirmPassword" placeholder="Confirm password" type="password" required />
      <StatusMessage status={status} />
      <Button className="w-full" disabled={status.type === "loading"} type="submit">
        {status.type === "loading" ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button disabled={loading} onClick={logout} size="sm" type="button" variant="outline">
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}
