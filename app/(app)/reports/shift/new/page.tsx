import { CheckboxPill, Field, FieldGrid, TextAreaField } from "@/components/reports/field-grid";
import { ReportWizardShell } from "@/components/reports/report-wizard-shell";
import { locationOptions, supportProvidedOptions } from "@/lib/config/report-options";

export default function NewShiftReportPage() {
  return (
    <ReportWizardShell
      title="Shift Report Builder"
      description="Complete one section at a time. Drafts autosave every 10 seconds once connected to Supabase."
      stepLabel="Section 1 of 12"
    >
      <div className="space-y-8">
        <FieldGrid>
          <Field label="Participant" />
          <Field label="Date" type="date" />
          <Field label="Staff" />
          <Field label="Shift type" placeholder="Day, evening, overnight, sleepover" />
          <Field label="Start time" type="time" />
          <Field label="End time" type="time" />
        </FieldGrid>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Participant Location Timeline</h2>
          <FieldGrid>
            <Field label="Time from" type="time" />
            <Field label="Time to" type="time" />
          </FieldGrid>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locationOptions.map((option) => (
              <CheckboxPill key={option} label={option} />
            ))}
          </div>
          <TextAreaField label="Notes" />
        </section>
        <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          For 1:1 support, the participant should remain within visual or auditory
          line of sight unless sleeping in a safe, risk-assessed bed. If participant
          location was unknown, notify your supervisor and follow company policy.
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Support Provided</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {supportProvidedOptions.map((option) => (
              <CheckboxPill key={option} label={option} />
            ))}
          </div>
        </section>
      </div>
    </ReportWizardShell>
  );
}
