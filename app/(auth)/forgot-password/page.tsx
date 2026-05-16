import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your email and we will send reset instructions.</p>
        <form className="mt-6 space-y-4">
          <input className="h-11 w-full rounded-md border px-3" placeholder="Email" type="email" />
          <Button className="w-full" type="button">Send reset link</Button>
        </form>
      </div>
    </main>
  );
}
