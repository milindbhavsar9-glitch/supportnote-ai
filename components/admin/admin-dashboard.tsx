"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  MessageSquare,
  Search,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoSessionId } from "@/lib/reports/demo-session";

type Metrics = {
  totalReportsThisWeek: number;
  draftReports: number;
  lateReports: number;
  incidentReports: number;
  reportsNeedingReview: number;
  medicationIssues: number;
  lineOfSightIssues: number;
  staffCompliance: Array<{
    staffName: string;
    totalReports: number;
    lateReports: number;
    incidentReports: number;
  }>;
};

type AdminReport = {
  id: string;
  type: "shift" | "incident";
  participantName: string;
  staffName: string;
  date: string;
  status: string;
  incidentType?: string;
  incidentFlag: boolean;
  medicationIssueFlag: boolean;
  lineOfSightIssueFlag: boolean;
  needsReview: boolean;
  finalReport?: string | null;
  comments: Array<{ id: string; comment: string; created_at: string }>;
};

const metricCards = [
  ["Total reports this week", "totalReportsThisWeek", ClipboardList],
  ["Draft reports", "draftReports", ClipboardList],
  ["Late reports", "lateReports", AlertTriangle],
  ["Incident reports", "incidentReports", FileWarning],
  ["Reports needing review", "reportsNeedingReview", Users],
  ["Task / procedure issues", "medicationIssues", ClipboardList],
  ["Visibility issues", "lineOfSightIssues", AlertTriangle]
] as const;

export function AdminDashboard() {
  const [sessionId, setSessionId] = useState("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [flag, setFlag] = useState("");
  const [staff, setStaff] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setSessionId(getDemoSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    void loadAdminData();
    // Load once when the demo session is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function loadAdminData() {
    await Promise.all([loadMetrics(), loadReports()]);
  }

  async function loadMetrics() {
    const response = await fetch("/api/admin/metrics", {
      headers: { "x-supportnote-session": sessionId }
    });
    if (!response.ok) return;
    setMetrics((await response.json()) as Metrics);
  }

  async function loadReports() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (flag) params.set("flag", flag);
    if (staff) params.set("staff", staff);

    const response = await fetch(`/api/admin/reports?${params.toString()}`, {
      headers: { "x-supportnote-session": sessionId }
    });
    const data = (await response.json()) as { reports?: AdminReport[]; error?: string };
    if (!response.ok) {
      setMessage(data.error || "Could not load admin reports.");
      return;
    }
    setReports(data.reports ?? []);
  }

  async function addComment(report: AdminReport) {
    const comment = commentDrafts[report.id]?.trim();
    if (!comment) return;

    const response = await fetch(`/api/admin/reports/${report.id}/comments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": sessionId
      },
      body: JSON.stringify({ reportType: report.type, comment })
    });

    if (!response.ok) {
      setMessage("Could not add comment.");
      return;
    }

    setCommentDrafts((current) => ({ ...current, [report.id]: "" }));
    setMessage("Comment added.");
    await loadReports();
  }

  async function markReviewed(report: AdminReport) {
    const response = await fetch(`/api/admin/reports/${report.id}/review`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": sessionId
      },
      body: JSON.stringify({ reportType: report.type })
    });

    if (!response.ok) {
      setMessage("Could not mark report as reviewed.");
      return;
    }

    setMessage("Report marked as reviewed.");
    await loadAdminData();
  }

  const visibleMetrics = useMemo(() => metrics ?? {
    totalReportsThisWeek: 0,
    draftReports: 0,
    lateReports: 0,
    incidentReports: 0,
    reportsNeedingReview: 0,
    medicationIssues: 0,
    lineOfSightIssues: 0,
    staffCompliance: []
  }, [metrics]);

  return (
    <div className="pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Review team reports, workplace flags, people/areas, and staff activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/admin/staff">Staff</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/participants">People / Areas</Link></Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, key, Icon]) => (
          <Card key={key}>
            <CardContent className="p-5">
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-3xl font-bold">{visibleMetrics[key]}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Admin report filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <input className="h-11 rounded-md border px-3" placeholder="Staff name" value={staff} onChange={(event) => setStaff(event.target.value)} />
          <select className="h-11 rounded-md border px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
            <option value="late">Late</option>
          </select>
          <select className="h-11 rounded-md border px-3" value={flag} onChange={(event) => setFlag(event.target.value)}>
            <option value="">All flags</option>
            <option value="incident">Incident flag</option>
            <option value="medication">Task / procedure issue</option>
            <option value="line_of_sight">Visibility issue</option>
            <option value="needs_review">Needs review</option>
          </select>
          <Button onClick={() => void loadReports()}><Search className="h-4 w-4" /> Search</Button>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.45fr]">
        <Card>
          <CardHeader><CardTitle>Reports needing review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports found for these filters.</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="rounded-md border bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{report.participantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.type} report - {report.staffName} - {report.date} - {report.status}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                        {report.incidentFlag ? <Badge label="Incident" /> : null}
                        {report.medicationIssueFlag ? <Badge label="Task / procedure issue" /> : null}
                        {report.lineOfSightIssueFlag ? <Badge label="Visibility issue" /> : null}
                        {report.needsReview ? <Badge label="Needs review" /> : null}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => void markReviewed(report)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Mark reviewed
                    </Button>
                  </div>

                  {report.comments.length ? (
                    <div className="mt-4 space-y-2">
                      {report.comments.map((comment) => (
                        <p key={comment.id} className="rounded-md bg-muted p-3 text-sm">
                          <MessageSquare className="mr-2 inline h-4 w-4 text-primary" />
                          {comment.comment}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-col gap-2 md:flex-row">
                    <input
                      className="h-11 flex-1 rounded-md border px-3"
                      placeholder="Add review comment"
                      value={commentDrafts[report.id] || ""}
                      onChange={(event) => setCommentDrafts((current) => ({ ...current, [report.id]: event.target.value }))}
                    />
                    <Button variant="outline" onClick={() => void addComment(report)}>Add comment</Button>
                  </div>
                </div>
              ))
            )}
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Staff compliance summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {visibleMetrics.staffCompliance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staff report activity yet.</p>
            ) : (
              visibleMetrics.staffCompliance.map((staffMember) => (
                <div key={staffMember.staffName} className="rounded-md border bg-white p-3">
                  <p className="font-semibold">{staffMember.staffName}</p>
                  <p className="text-sm text-muted-foreground">
                    {staffMember.totalReports} reports, {staffMember.lateReports} late, {staffMember.incidentReports} incident
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-900">
      {label}
    </span>
  );
}
