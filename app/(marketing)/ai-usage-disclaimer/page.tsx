export default function AIUsageDisclaimerPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">AI Usage Disclaimer</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          SupportNote AI uses AI as a drafting aid. AI can make mistakes, misunderstand
          context, omit important information, or produce wording that is not suitable
          for your workplace or reporting obligation.
        </p>
        <p>
          AI output is not professional, legal, or manager advice. You
          must review, edit, and approve all AI-generated text before saving,
          copying, exporting, or submitting a report.
        </p>
        <p>
          AI must not be used to hide, minimise, soften, exaggerate, or change incident
          facts. Do not use AI to remove relevant details about risk, injury, unknown
          location, visibility concerns, task/procedure errors, aggression, policy
          concerns, or required notifications.
        </p>
        <p>
          Serious incidents must be escalated according to your workplace policies
          and legal obligations. SupportNote AI does not replace those obligations.
        </p>
      </div>
    </main>
  );
}
