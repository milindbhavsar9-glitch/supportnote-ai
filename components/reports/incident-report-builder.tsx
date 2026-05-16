"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, ClipboardCopy, FileText, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { incidentTypes, locationOptions } from "@/lib/config/report-options";
import { getDemoSessionId } from "@/lib/reports/demo-session";
import {
  buildIncidentReportText,
  defaultIncidentReportForm,
  type IncidentReportForm
} from "@/lib/reports/incident-report";

type SaveState = "idle" | "saving" | "saved" | "error";

function OptionButton({ selected, label, onClick }: { selected: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition ${
        selected ? "border-primary bg-secondary text-primary" : "bg-white hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="h-11 w-full rounded-md border bg-white px-3 text-base outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-md border bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

export function IncidentReportBuilder() {
  const [form, setForm] = useState<IncidentReportForm>(defaultIncidentReportForm);
  const [reportId, setReportId] = useState("");
  const [status, setStatus] = useState("Draft");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const initialized = useRef(false);

  const finalReport = useMemo(() => buildIncidentReportText(form), [form]);
  const isHighRisk = [
    "Physical aggression",
    "Self-harm",
    "Fall",
    "Elopement / absconding",
    "Medication error",
    "Injury",
    "Missing participant",
    "Location unknown",
    "Neglect concern"
  ].includes(form.incidentType);
  const hasLineOfSightIssue =
    form.lineOfSightMaintained === "No" ||
    form.participantLocationUnknown === "Yes" ||
    form.participantUnsupervised === "Yes" ||
    ["Missing participant", "Location unknown"].includes(form.incidentType);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setForm((current) => ({ ...current, clientSessionId: getDemoSessionId() }));
  }, []);

  function update<K extends keyof IncidentReportForm>(key: K, value: IncidentReportForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveDraft({ quiet = false }: { quiet?: boolean } = {}) {
    if (!form.clientSessionId || form.clientSessionId === "pending") return "";
    if (!form.participantName || !form.staffName || !form.incidentDate || !form.location || !form.incidentType) {
      if (!quiet) setMessage("Add participant, date, location, report completed by, and incident type before saving.");
      return "";
    }

    setSaveState("saving");
    setMessage(quiet ? "" : "Saving incident draft...");

    const endpoint = reportId ? `/api/reports/incident/${reportId}` : "/api/reports/incident";
    const response = await fetch(endpoint, {
      method: reportId ? "PATCH" : "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": form.clientSessionId
      },
      body: JSON.stringify({ form, finalReport })
    });

    if (!response.ok) {
      setSaveState("error");
      setMessage("Could not save incident report. Check Supabase environment variables.");
      return "";
    }

    const data = (await response.json()) as { report: { id: string; status: string } };
    setReportId(data.report.id);
    setStatus(data.report.status);
    setSaveState("saved");
    setMessage("Saved automatically.");
    return data.report.id;
  }

  async function changeStatus(action: "submit" | "complete") {
    const savedId = await saveDraft({ quiet: true });
    const id = savedId || reportId;
    if (!id) {
      setMessage("Save the incident report before changing status.");
      return;
    }

    const response = await fetch(`/api/reports/incident/${id}/${action}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": form.clientSessionId
      },
      body: "{}"
    });

    if (!response.ok) {
      setMessage("Could not update incident report status.");
      return;
    }

    const data = (await response.json()) as { report: { status: string } };
    setStatus(data.report.status);
    setMessage(action === "submit" ? "Incident report submitted." : "Incident report marked as completed.");
  }

  async function copyReport() {
    await navigator.clipboard.writeText(finalReport);
    setMessage("Report copied successfully.");
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      void saveDraft({ quiet: true });
    }, 10000);

    return () => window.clearInterval(timer);
  });

  return (
    <div className="mx-auto max-w-5xl pb-28">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Phase 3 Incident Reports</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Incident Report Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Save real incident drafts to Supabase, track line of sight concerns, preview the final report, copy it, submit it, and find it in Search Records.
          </p>
        </div>
        <div className="rounded-md border bg-white px-4 py-3 text-sm">
          <span className="font-semibold">Status:</span> {status}
          <span className="ml-3 text-muted-foreground">{saveState === "saving" ? "Saving..." : message}</span>
        </div>
      </div>

      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        Demo saving is active. Use fake participant names while login is still being built.
      </div>

      {(isHighRisk || hasLineOfSightIssue) && (
        <div className="mb-6 flex gap-3 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            This incident may require supervisor notification and formal incident reporting. Follow your organisation&apos;s policy and NDIS reporting requirements.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Incident details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Participant name" value={form.participantName} onChange={(value) => update("participantName", value)} />
              <Input label="Date of incident" type="date" value={form.incidentDate} onChange={(value) => update("incidentDate", value)} />
              <Input label="Time of incident" type="time" value={form.incidentTime} onChange={(value) => update("incidentTime", value)} />
              <Input label="Report completed by" value={form.staffName} onChange={(value) => update("staffName", value)} />
              <Input label="Staff present" value={form.staffPresent} onChange={(value) => update("staffPresent", value)} />
              <Input label="Witnesses" value={form.witnesses} onChange={(value) => update("witnesses", value)} />
              <Input label="Other people involved" value={form.otherPeopleInvolved} onChange={(value) => update("otherPeopleInvolved", value)} />
              <Input label="Location" value={form.location} onChange={(value) => update("location", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick location buttons</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {locationOptions.map((location) => (
                  <OptionButton key={location} label={location} selected={form.location === location} onClick={() => update("location", location)} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Incident type</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {incidentTypes.map((type) => (
                <OptionButton key={type} label={type} selected={form.incidentType === type} onClick={() => update("incidentType", type)} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>What happened?</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Textarea label="What happened before the incident?" value={form.beforeIncident} onChange={(value) => update("beforeIncident", value)} />
              <Textarea label="What happened during the incident?" value={form.duringIncident} onChange={(value) => update("duringIncident", value)} />
              <Textarea label="What happened after the incident?" value={form.afterIncident} onChange={(value) => update("afterIncident", value)} />
              <Textarea label="Exact words spoken, if relevant" value={form.exactWords} onChange={(value) => update("exactWords", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Injuries, first aid, and notifications</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Textarea label="Injuries observed" value={form.injuriesObserved} onChange={(value) => update("injuriesObserved", value)} />
              <Textarea label="First aid provided" value={form.firstAidProvided} onChange={(value) => update("firstAidProvided", value)} />
              <Textarea label="Immediate safety actions" value={form.immediateSafetyActions} onChange={(value) => update("immediateSafetyActions", value)} />
              <YesNo label="Emergency services contacted?" value={form.emergencyServicesContacted} onChange={(value) => update("emergencyServicesContacted", value)} />
              <YesNo label="Supervisor notified?" value={form.supervisorNotified} onChange={(value) => update("supervisorNotified", value)} />
              <div className="space-y-2">
                <p className="text-sm font-medium">Family / guardian notified?</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {["Yes", "No", "Not required"].map((choice) => (
                    <OptionButton key={choice} label={choice} selected={form.familyGuardianNotified === choice} onClick={() => update("familyGuardianNotified", choice)} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Line of Sight / Location Concerns</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                If participant location was unknown, line of sight was not maintained, or the participant was unsupervised, notify your supervisor and follow company policy.
              </div>
              <div className="space-y-4">
                <YesNo label="Was visual or auditory line of sight maintained?" value={form.lineOfSightMaintained} onChange={(value) => update("lineOfSightMaintained", value)} />
                <YesNo label="Was participant location unknown at any time?" value={form.participantLocationUnknown} onChange={(value) => update("participantLocationUnknown", value)} />
                <YesNo label="Was participant ever unsupervised?" value={form.participantUnsupervised} onChange={(value) => update("participantUnsupervised", value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Follow-up and confirmation</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Textarea label="Follow-up required" value={form.followUpRequired} onChange={(value) => update("followUpRequired", value)} />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Signature" value={form.signature} onChange={(value) => update("signature", value)} />
                <Input label="Time completed" type="time" value={form.timeCompleted} onChange={(value) => update("timeCompleted", value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Final Incident Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className={`max-h-[720px] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm leading-6 ${showPreview ? "" : "hidden lg:block"}`}>
                {finalReport}
              </pre>
              <Button variant="outline" className="mt-4 w-full lg:hidden" onClick={() => setShowPreview((value) => !value)}>
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 lg:left-64">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 md:grid-cols-5">
          <Button variant="outline" onClick={() => void saveDraft()}><Save className="h-4 w-4" /> Save Draft</Button>
          <Button variant="secondary" onClick={() => void copyReport()}><ClipboardCopy className="h-4 w-4" /> Copy</Button>
          <Button variant="outline" onClick={() => setShowPreview((value) => !value)}><FileText className="h-4 w-4" /> Preview</Button>
          <Button onClick={() => void changeStatus("submit")}><Send className="h-4 w-4" /> Submit</Button>
          <Button variant="accent" onClick={() => void changeStatus("complete")}><Check className="h-4 w-4" /> Complete</Button>
        </div>
      </div>
    </div>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {["Yes", "No"].map((choice) => (
          <OptionButton key={choice} label={choice} selected={value === choice} onClick={() => onChange(choice)} />
        ))}
      </div>
    </div>
  );
}
