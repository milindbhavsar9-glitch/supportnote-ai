import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Questions about SupportNote AI for your team? Send a message and we will
        get back to you.
      </p>
      <form className="mt-8 space-y-4">
        <input className="h-11 w-full rounded-md border px-3" placeholder="Your name" />
        <input className="h-11 w-full rounded-md border px-3" placeholder="Email address" type="email" />
        <textarea className="min-h-32 w-full rounded-md border px-3 py-3" placeholder="How can we help?" />
        <Button type="button">Send Message</Button>
      </form>
    </main>
  );
}
