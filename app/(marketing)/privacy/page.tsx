export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          SupportNote AI is designed for sensitive support documentation. Version 1
          minimises participant information, requires login for report access, and
          keeps billing and AI secrets server-side.
        </p>
        <p>
          Users are responsible for ensuring their organisation permits use of this
          tool and for reviewing all AI-generated text before saving or submitting.
        </p>
        <p>
          A full legal privacy policy should be reviewed by an Australian privacy
          professional before production launch.
        </p>
      </div>
    </main>
  );
}
