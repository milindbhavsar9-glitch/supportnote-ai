import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-semibold text-foreground">SupportNote AI</p>
          <p className="mt-2 max-w-xl">
            Documentation support for disability, SIL, NDIS, and mental health
            support workers.
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Product</p>
          <Link href="/pricing" className="block">Pricing</Link>
          <Link href="/demo" className="block">Demo</Link>
          <Link href="/contact" className="block">Contact</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Legal</p>
          <Link href="/privacy" className="block">Privacy Policy</Link>
          <Link href="/terms" className="block">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
