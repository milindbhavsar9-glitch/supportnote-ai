export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          SupportNote AI helps prepare documentation but does not replace your
          workplace policies, manager review, professional judgement, or legal
          obligations. Users are responsible for following their workplace policies
          and legal obligations.
        </p>
        <p>
          Users are responsible for the accuracy, completeness, and appropriateness
          of all reports they create, copy, export, save, or submit. AI-generated
          text must be reviewed and edited before use.
        </p>
        <p>
          You must only use the service for workplace documentation you are authorised
          to prepare. You must not use SupportNote AI to hide, minimise, alter, or
          misrepresent incident facts.
        </p>
        <p>
          During private company testing, billing and payments are disabled. If
          billing is enabled later, plan changes, cancellations, failed payments,
          and customer portal access may be handled through Stripe.
        </p>
        <p>
          These terms are a working launch draft. The app owner should ask an
          Australian lawyer to review the Terms of Service, Privacy Policy, and
          subscription wording before public launch.
        </p>
      </div>
    </main>
  );
}
