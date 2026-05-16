"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ClipboardCopy, Download, FileText, Printer, Save, Send, ShieldAlert } from "lucide-react";
import { AIWritingHelper } from "@/components/reports/ai-writing-helper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { incidentTypes, locationOptions, supportProvidedOptions } from "@/lib/config/report-options";
import { getDemoSessionId } from "@/lib/reports/demo-session";
import {
  buildShiftReportText,
  defaultShiftReportForm,
  type ShiftReportForm
} from "@/lib/reports/shift-report";

const choiceGroups = {
  shiftType: ["Day", "Evening", "Overnight", "Sleepover"],
  yesNo: ["Yes", "No"],
  yesNoNa: ["Yes", "No", "Not applicable"],
  medication: ["Yes, chart signed", "No", "Refused", "Held", "Not scheduled"],
  meal: ["25%", "50%", "75%", "100%", "Not applicable"],
  fluids: ["Adequate", "Poor", "Refused"],
  mood: ["Stable", "Anxious", "Irritable", "Withdrawn", "Sad", "Elated", "Flat", "Labile", "Calm", "Happy"],
  engagement: ["Engaged", "Partial", "Disengaged"],
  sleep: ["Adequate", "Fragmented", "Insomnia", "Unknown"]
};

const positiveBehaviour = ["Helpful", "Calm", "Participated", "Friendly", "Cooperative", "Other"];
const challengingBehaviour = ["Verbal aggression", "Property damage", "Self-isolation", "Physical aggression", "Refused support", "Agitated", "Other"];
const deEscalation = ["Redirection", "Calm talk", "Space given", "PRN medication", "Positive reassurance", "Distraction activity", "Other"];
const followUp = ["Medical", "Behavioural", "Medication", "Family contact", "Appointment", "Cleaning", "Shopping", "Other"];

type SaveState = "idle" | "saving" | "saved" | "error";

function OptionButton({
  selected,
  label,
  onClick
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
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

function Textarea({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
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

export function ShiftReportBuilder() {
  const [form, setForm] = useState<ShiftReportForm>(defaultShiftReportForm);
  const [reportId, setReportId] = useState<string>("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [status, setStatus] = useState("Draft");
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const initialized = useRef(false);

  const finalReport = useMemo(() => buildShiftReportText(form), [form]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setForm((current) => ({
      ...current,
      clientSessionId: getDemoSessionId()
    }));
  }, []);

  function update<K extends keyof ShiftReportForm>(key: K, value: ShiftReportForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleList(key: "positiveBehaviours" | "challengingBehaviours" | "deEscalation" | "supportProvided" | "followUpOn", value: string) {
    setForm((current) => {
      const existing = current[key];
      return {
        ...current,
        [key]: existing.includes(value)
          ? existing.filter((item) => item !== value)
          : [...existing, value]
      };
    });
  }

  async function saveDraft({ quiet = false }: { quiet?: boolean } = {}) {
    if (!form.clientSessionId || form.clientSessionId === "pending") return "";
    if (!form.participantName || !form.staffName || !form.reportDate) {
      if (!quiet) {
        setMessage("Add participant, staff, and date before saving.");
      }
      return "";
    }

    setSaveState("saving");
    setMessage(quiet ? "" : "Saving draft...");

    const endpoint = reportId ? `/api/reports/shift/${reportId}` : "/api/reports/shift";
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
      setMessage("Could not save. Check Supabase environment variables and try again.");
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
      setMessage("Save the draft before changing status.");
      return;
    }

    const response = await fetch(`/api/reports/shift/${id}/${action}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": form.clientSessionId
      },
      body: JSON.stringify({ form, finalReport })
    });

    if (!response.ok) {
      setMessage("Could not update report status.");
      return;
    }

    const data = (await response.json()) as { report: { status: string } };
    setStatus(data.report.status);
    setMessage(action === "submit" ? "Report submitted." : "Report marked as completed.");
  }

  async function copyReport() {
    await navigator.clipboard.writeText(finalReport);
    setMessage("Report copied successfully.");
  }

  function downloadPdf() {
    if (!reportId) {
      setMessage("Save the report before downloading PDF.");
      return;
    }

    window.open(`/api/reports/shift/${reportId}/pdf?session=${encodeURIComponent(form.clientSessionId)}`, "_blank");
  }

  function printReport() {
    window.print();
  }

  function applyAIText(text: string) {
    update("aiReviewedText", text);
    setMessage("AI reviewed text added. Review it, then save the draft.");
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
          <p className="text-sm font-semibold text-primary">Phase 2 Shift Reports</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Shift Report Builder</h1>
          <p className="mt-2 text-muted-foreground">
            Create a real draft, autosave it to Supabase every 10 seconds, preview the final report, copy it, submit it, and find it in Search Records.
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

      <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shift details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Participant" value={form.participantName} onChange={(value) => update("participantName", value)} />
              <Input label="Date" type="date" value={form.reportDate} onChange={(value) => update("reportDate", value)} />
              <Input label="Staff" value={form.staffName} onChange={(value) => update("staffName", value)} />
              <div className="space-y-2">
                <p className="text-sm font-medium">Shift type</p>
                <div className="grid grid-cols-2 gap-2">
                  {choiceGroups.shiftType.map((choice) => (
                    <OptionButton key={choice} label={choice} selected={form.shiftType === choice} onClick={() => update("shiftType", choice)} />
                  ))}
                </div>
              </div>
              <Input label="Start time" type="time" value={form.startTime} onChange={(value) => update("startTime", value)} />
              <Input label="End time" type="time" value={form.endTime} onChange={(value) => update("endTime", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>1. Handover Received</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Time" type="time" value={form.handoverTime} onChange={(value) => update("handoverTime", value)} />
              <Input label="From" value={form.handoverFrom} onChange={(value) => update("handoverFrom", value)} />
              <div className="md:col-span-2">
                <Textarea label="Key issues" value={form.handoverKeyIssues} onChange={(value) => update("handoverKeyIssues", value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>2. Participant Location Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Time from" type="time" value={form.locationFrom} onChange={(value) => update("locationFrom", value)} />
                <Input label="Time to" type="time" value={form.locationTo} onChange={(value) => update("locationTo", value)} />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {locationOptions.map((location) => (
                  <OptionButton key={location} label={location} selected={form.location === location} onClick={() => update("location", location)} />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {choiceGroups.yesNo.map((choice) => (
                  <OptionButton key={choice} label={`Staff present: ${choice}`} selected={form.staffPresent === choice} onClick={() => update("staffPresent", choice)} />
                ))}
              </div>
              <Textarea label="Notes" value={form.locationNotes} onChange={(value) => update("locationNotes", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>3. Line of Sight / Duty of Care</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                For 1:1 support, the participant should remain within visual or auditory line of sight unless sleeping in a safe, risk-assessed bed. If participant location was unknown, notify your supervisor and follow company policy.
              </div>
              {[
                ["oneToOneSupport", "Was this 1:1 support?", choiceGroups.yesNo],
                ["lineOfSightMaintained", "Was visual or auditory line of sight maintained?", choiceGroups.yesNoNa],
                ["participantUnsupervised", "Was participant ever unsupervised?", choiceGroups.yesNo],
                ["locationUnknown", "Was participant location unknown at any time?", choiceGroups.yesNo]
              ].map(([key, label, options]) => (
                <div key={String(key)} className="space-y-2">
                  <p className="text-sm font-medium">{String(label)}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(options as string[]).map((choice) => (
                      <OptionButton key={choice} label={choice} selected={form[key as keyof ShiftReportForm] === choice} onClick={() => update(key as keyof ShiftReportForm, choice as never)} />
                    ))}
                  </div>
                </div>
              ))}
              <Textarea label="If yes, explain" value={form.lineOfSightExplain} onChange={(value) => update("lineOfSightExplain", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>4. Medication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {choiceGroups.medication.map((choice) => (
                  <OptionButton key={choice} label={choice} selected={form.medicationStatus === choice} onClick={() => update("medicationStatus", choice)} />
                ))}
              </div>
              {["Refused", "Held"].includes(form.medicationStatus) ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Reason" value={form.medicationReason} onChange={(value) => update("medicationReason", value)} />
                  <Input label="Supervisor notified? Yes / No" value={form.medicationSupervisorNotified} onChange={(value) => update("medicationSupervisorNotified", value)} />
                  <div className="md:col-span-2">
                    <Textarea label="Follow-up required" value={form.medicationFollowUp} onChange={(value) => update("medicationFollowUp", value)} />
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>5. Meals and Fluids</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                <div key={meal} className="space-y-2">
                  <p className="text-sm font-medium capitalize">{meal}</p>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {choiceGroups.meal.map((choice) => (
                      <OptionButton key={choice} label={choice} selected={form[meal] === choice} onClick={() => update(meal, choice)} />
                    ))}
                  </div>
                </div>
              ))}
              <Input label="Snacks: Yes / No" value={form.snacks} onChange={(value) => update("snacks", value)} />
              <Input label="Fluids: cups or status" value={form.fluids} onChange={(value) => update("fluids", value)} />
              <Textarea label="Notes" value={form.mealNotes} onChange={(value) => update("mealNotes", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>6. Behaviour</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <MultiChoice title="Positive behaviour" options={positiveBehaviour} values={form.positiveBehaviours} onToggle={(value) => toggleList("positiveBehaviours", value)} />
              <MultiChoice title="Challenging behaviour" options={challengingBehaviour} values={form.challengingBehaviours} onToggle={(value) => toggleList("challengingBehaviours", value)} />
              <Textarea label="Triggers" value={form.triggers} onChange={(value) => update("triggers", value)} />
              <MultiChoice title="De-escalation used" options={deEscalation} values={form.deEscalation} onToggle={(value) => toggleList("deEscalation", value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>7. Incidents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {["None", "Yes"].map((choice) => (
                  <OptionButton key={choice} label={choice} selected={form.incidentOccurred === choice} onClick={() => update("incidentOccurred", choice)} />
                ))}
              </div>
              {form.incidentOccurred === "Yes" ? (
                <>
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                    This may require supervisor notification and formal incident reporting. Follow your organisation&apos;s policy and NDIS reporting requirements.
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {incidentTypes.map((type) => (
                      <OptionButton key={type} label={type} selected={form.incidentType === type} onClick={() => update("incidentType", type)} />
                    ))}
                  </div>
                  <Textarea label="Brief description" value={form.incidentDescription} onChange={(value) => update("incidentDescription", value)} />
                  <Textarea label="Immediate action taken" value={form.immediateAction} onChange={(value) => update("immediateAction", value)} />
                  <Input label="Witnesses" value={form.witnesses} onChange={(value) => update("witnesses", value)} />
                  <Input label="Supervisor notified? Yes / No" value={form.supervisorNotified} onChange={(value) => update("supervisorNotified", value)} />
                  <Input label="Family / guardian notified?" value={form.guardianNotified} onChange={(value) => update("guardianNotified", value)} />
                  <Input label="Report filed? Yes / No" value={form.reportFiled} onChange={(value) => update("reportFiled", value)} />
                  <Input label="Report number" value={form.reportNumber} onChange={(value) => update("reportNumber", value)} />
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>8-12. Final Notes</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Textarea label="Client said" value={form.clientQuote} onChange={(value) => update("clientQuote", value)} />
              <MultiChoice title="Support provided" options={supportProvidedOptions} values={form.supportProvided} onToggle={(value) => toggleList("supportProvided", value)} />
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Mood" value={form.mood} onChange={(value) => update("mood", value)} />
                <Input label="Engagement" value={form.engagement} onChange={(value) => update("engagement", value)} />
                <Input label="Sleep past 24 hours" value={form.sleep} onChange={(value) => update("sleep", value)} />
              </div>
              <Textarea label="Handover notes" value={form.handoverNotes} onChange={(value) => update("handoverNotes", value)} />
              <MultiChoice title="Follow-up on" options={followUp} values={form.followUpOn} onToggle={(value) => toggleList("followUpOn", value)} />
              <Textarea label="Other observations" value={form.otherObservations} onChange={(value) => update("otherObservations", value)} />
              <Textarea label="AI reviewed text" value={form.aiReviewedText} onChange={(value) => update("aiReviewedText", value)} />
              <label className="flex items-center gap-3 rounded-md border bg-white p-4 text-sm font-semibold">
                <input type="checkbox" checked={form.confirmation} onChange={(event) => update("confirmation", event.target.checked)} className="h-5 w-5 accent-primary" />
                I confirm this report is complete and accurate.
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Signature" value={form.signature} onChange={(value) => update("signature", value)} />
                <Input label="Time completed" type="time" value={form.timeCompleted} onChange={(value) => update("timeCompleted", value)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-6">
            <AIWritingHelper
              reportType="shift"
              sourceText={finalReport}
              clientSessionId={form.clientSessionId}
              reportId={reportId || undefined}
              onApply={applyAIText}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Final Report Preview</CardTitle>
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
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 lg:left-64">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 md:grid-cols-7">
          <Button variant="outline" onClick={() => void saveDraft()}><Save className="h-4 w-4" /> Save Draft</Button>
          <Button variant="secondary" onClick={() => void copyReport()}><ClipboardCopy className="h-4 w-4" /> Copy</Button>
          <Button variant="outline" onClick={() => setShowPreview((value) => !value)}><FileText className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" onClick={downloadPdf}><Download className="h-4 w-4" /> PDF</Button>
          <Button variant="outline" onClick={printReport}><Printer className="h-4 w-4" /> Print</Button>
          <Button onClick={() => void changeStatus("submit")}><Send className="h-4 w-4" /> Submit</Button>
          <Button variant="accent" onClick={() => void changeStatus("complete")}><Check className="h-4 w-4" /> Complete</Button>
        </div>
      </div>
    </div>
  );
}

function MultiChoice({
  title,
  options,
  values,
  onToggle
}: {
  title: string;
  options: string[];
  values: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex min-h-12 items-center gap-2 rounded-md border px-4 py-3 text-left text-sm font-semibold ${
              values.includes(option) ? "border-primary bg-secondary text-primary" : "bg-white hover:bg-muted"
            }`}
          >
            {values.includes(option) ? <Check className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
