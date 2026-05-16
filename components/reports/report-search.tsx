"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoSessionId } from "@/lib/reports/demo-session";

type SavedShiftReport = {
  id: string;
  participant_name: string;
  staff_name: string;
  report_date: string;
  status: string;
  incident_flag: boolean;
  medication_issue_flag: boolean;
  behaviour_issue_flag: boolean;
  line_of_sight_issue_flag: boolean;
  updated_at: string;
};

export function ReportSearch() {
  const [sessionId, setSessionId] = useState("");
  const [reports, setReports] = useState<SavedShiftReport[]>([]);
  const [participant, setParticipant] = useState("");
  const [staff, setStaff] = useState("");
  const [status, setStatus] = useState("");
  const [incidentOnly, setIncidentOnly] = useState(false);
  const [medicationOnly, setMedicationOnly] = useState(false);
  const [lineOfSightOnly, setLineOfSightOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSessionId(getDemoSessionId());
  }, []);

  async function loadReports() {
    if (!sessionId) return;

    setLoading(true);
    setMessage("");

    const params = new URLSearchParams();
    if (participant) params.set("participant", participant);
    if (staff) params.set("staff", staff);
    if (status) params.set("status", status);
    if (incidentOnly) params.set("incident", "true");
    if (medicationOnly) params.set("medication", "true");
    if (lineOfSightOnly) params.set("line_of_sight", "true");

    const response = await fetch(`/api/reports?${params.toString()}`, {
      headers: {
        "x-supportnote-session": sessionId
      }
    });

    if (!response.ok) {
      setMessage("Could not load reports. Check Supabase environment variables.");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { reports: SavedShiftReport[] };
    setReports(data.reports);
    setLoading(false);
  }

  useEffect(() => {
    if (sessionId) {
      void loadReports();
    }
    // The initial load should run only when the demo session becomes available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <div className="pb-20 lg:pb-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Records</h1>
          <p className="mt-2 text-muted-foreground">
            Find shift reports saved from this browser demo session.
          </p>
        </div>
        <Button asChild>
          <Link href="/reports/shift/new">Create Shift Report</Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={participant}
              onChange={(event) => setParticipant(event.target.value)}
              className="h-11 rounded-md border px-3"
              placeholder="Participant"
            />
            <input
              value={staff}
              onChange={(event) => setStaff(event.target.value)}
              className="h-11 rounded-md border px-3"
              placeholder="Staff"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-md border px-3"
            >
              <option value="">Any status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
              <option value="late">Late</option>
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Incident flag", incidentOnly, setIncidentOnly],
              ["Medication issue", medicationOnly, setMedicationOnly],
              ["Line of sight issue", lineOfSightOnly, setLineOfSightOnly]
            ].map(([label, checked, setter]) => (
              <label key={String(label)} className="flex min-h-11 items-center gap-3 rounded-md border bg-white px-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={(event) =>
                    (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)
                  }
                  className="h-5 w-5 accent-primary"
                />
                {String(label)}
              </label>
            ))}
          </div>
          <Button onClick={() => void loadReports()} disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? "Searching..." : "Search"}
          </Button>
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved reports</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No saved shift reports found yet. Create a shift report and click Save Draft.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-2">Participant</th>
                    <th>Staff</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Flags</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t">
                      <td className="py-3 font-semibold">{report.participant_name}</td>
                      <td>{report.staff_name}</td>
                      <td>{report.report_date}</td>
                      <td className="capitalize">{report.status}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {report.incident_flag ? <Flag label="Incident" /> : null}
                          {report.medication_issue_flag ? <Flag label="Medication" /> : null}
                          {report.behaviour_issue_flag ? <Flag label="Behaviour" /> : null}
                          {report.line_of_sight_issue_flag ? <Flag label="Line of sight" /> : null}
                          {!report.incident_flag && !report.medication_issue_flag && !report.behaviour_issue_flag && !report.line_of_sight_issue_flag ? (
                            <span className="text-muted-foreground">None</span>
                          ) : null}
                        </div>
                      </td>
                      <td>{new Date(report.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Flag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
      <AlertTriangle className="h-3 w-3" />
      {label}
    </span>
  );
}
