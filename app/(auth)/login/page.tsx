import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your SupportNote AI dashboard.</p>
        <form className="mt-6 space-y-4">
          <input className="h-11 w-full rounded-md border px-3" placeholder="Email" type="email" />
          <input className="h-11 w-full rounded-md border px-3" placeholder="Password" type="password" />
          <Button className="w-full" type="button">Log in</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-primary">Forgot password?</Link>
          <Link href="/signup" className="font-semibold text-primary">Create account</Link>
        </div>
      </div>
    </main>
  );
}
