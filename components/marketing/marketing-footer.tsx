import Link from "next/link";
import { INTERNAL_TESTING_MESSAGE } from "@/lib/config/billing";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-semibold text-foreground">SupportNote AI</p>
          <p className="mt-2 max-w-xl">
            Clear shift reports and incident notes for everyday workplace teams.
          </p>
          <p className="mt-3 max-w-xl rounded-md bg-secondary px-3 py-2 text-xs text-foreground">
            {INTERNAL_TESTING_MESSAGE}
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Product</p>
          <Link href="/signup" className="block">Create Account</Link>
          <Link href="/login" className="block">Login</Link>
          <Link href="/contact" className="block">Contact</Link>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-foreground">Legal</p>
          <Link href="/privacy" className="block">Privacy Policy</Link>
          <Link href="/terms" className="block">Terms of Service</Link>
          <Link href="/data-handling-notice" className="block">Data Handling Notice</Link>
          <Link href="/ai-usage-disclaimer" className="block">AI Usage Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
