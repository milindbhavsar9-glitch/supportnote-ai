import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Start your free trial</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create your account and begin with 7 days free.</p>
        <form className="mt-6 space-y-4">
          <input className="h-11 w-full rounded-md border px-3" placeholder="Full name" />
          <input className="h-11 w-full rounded-md border px-3" placeholder="Email" type="email" />
          <input className="h-11 w-full rounded-md border px-3" placeholder="Password" type="password" />
          <Button className="w-full" type="button">Create account</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-semibold text-primary">Log in</Link>
        </p>
      </div>
    </main>
  );
}
