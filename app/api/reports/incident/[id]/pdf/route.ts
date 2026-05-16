import { NextResponse } from "next/server";
import { createReportPdf, pdfResponse } from "@/lib/pdf/report-pdf";
import {
  getClientSessionId,
  getIncidentReportForSession,
  missingSessionResponse
} from "@/lib/reports/api";

async function handlePdf(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionId = getClientSessionId(request) || new URL(request.url).searchParams.get("session") || "";
  if (!sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const { data, error } = await getIncidentReportForSession(id, sessionId);
  if (error || !data) {
    return NextResponse.json({ error: "Incident report not found." }, { status: 404 });
  }

  const report = data as unknown as {
    participant_name: string;
    incident_date: string;
    incident_time?: string | null;
    staff_name: string;
    final_report?: string | null;
    signature?: string | null;
    time_completed?: string | null;
  };

  const pdf = createReportPdf({
    companyName: "SupportNote AI Demo Company",
    reportType: "Incident Report",
    participant: report.participant_name,
    date: report.incident_date,
    staff: report.staff_name,
    timeLabel: "Incident time",
    timeValue: report.incident_time || "Not recorded",
    content: report.final_report || "No report content saved.",
    signature: report.signature,
    timeCompleted: report.time_completed
  });

  return pdfResponse(pdf, `incident-report-${id}.pdf`);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handlePdf(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handlePdf(request, context);
}
