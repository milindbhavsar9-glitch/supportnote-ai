export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          SupportNote AI collects account information such as name, email, role,
          company or team details, subscription status, and basic security records
          such as legal acceptance timestamps.
        </p>
        <p>
          Users may enter report information such as person/area display names,
          workplace subject names, staff names, shift notes, incident details,
          task/procedure flags, behaviour or conduct flags, visibility concerns,
          signatures, and review comments.
          Users should only enter information they are authorised and required to
          record for their work.
        </p>
        <p>
          Information is collected to create, store, search, review, copy, export,
          and manage shift reports and incident reports. Reports are stored in
          Supabase/PostgreSQL with tenant and role-based access controls.
        </p>
        <p>
          Access depends on account role. Solo users and workers should only
          access their own reports. Team leaders and company admins may access team
          reports where their company has permission to do so.
        </p>
        <p>
          AI may be used to draft, shorten, reword, or correct report text. AI output
          is a drafting aid only and must be reviewed before saving or submitting.
          API keys are kept server-side.
        </p>
        <p>
          Billing information is handled through Stripe. SupportNote AI stores
          subscription status and billing event references, while card/payment details
          are handled by Stripe.
        </p>
        <p>
          Users can request account deletion or data export through account settings
          or by contacting privacy@supportnote.ai. Some records may need to be
          retained according to legal, audit, billing, or workplace obligations.
        </p>
        <p>
          This privacy policy is a working launch draft. The app owner should ask an
          Australian privacy/legal professional to review it before public launch.
        </p>
      </div>
    </main>
  );
}
