import Link from "next/link";
import { SignupForm } from "@/components/auth/auth-forms";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account for private company testing. Use fake workplace data until production security is fully reviewed.
        </p>
        <SignupForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="font-semibold text-primary">Log in</Link>
        </p>
      </div>
    </main>
  );
}
