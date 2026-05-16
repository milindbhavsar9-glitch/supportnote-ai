import { CheckboxPill, Field, FieldGrid, TextAreaField } from "@/components/reports/field-grid";
import { ReportWizardShell } from "@/components/reports/report-wizard-shell";
import { incidentTypes } from "@/lib/config/report-options";

export default function NewIncidentReportPage() {
  return (
    <ReportWizardShell
      title="Incident Report Builder"
      description="Record what happened before, during, and after the incident using factual language."
      stepLabel="Incident details"
    >
      <div className="space-y-8">
        <FieldGrid>
          <Field label="Participant name" />
          <Field label="Date of incident" type="date" />
          <Field label="Time of incident" type="time" />
          <Field label="Location" />
          <Field label="Staff present" />
          <Field label="Witnesses" />
        </FieldGrid>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Incident type</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {incidentTypes.map((type) => (
              <CheckboxPill key={type} label={type} />
            ))}
          </div>
        </section>
        <div className="grid gap-4">
          <TextAreaField label="What happened before the incident?" />
          <TextAreaField label="What happened during the incident?" />
          <TextAreaField label="What happened after the incident?" />
          <TextAreaField label="Exact words spoken, if relevant" />
          <TextAreaField label="Follow-up required" />
        </div>
        <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          This may require supervisor notification and formal incident reporting.
          Follow your organisation’s policy and NDIS reporting requirements.
        </section>
      </div>
    </ReportWizardShell>
  );
}
