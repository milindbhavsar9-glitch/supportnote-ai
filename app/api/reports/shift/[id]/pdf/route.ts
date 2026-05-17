import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/auth/request-context";
import { createReportPdf, pdfResponse } from "@/lib/pdf/report-pdf";
import {
  getClientSessionId,
  getShiftReportForContext,
  getShiftReportForSession,
  missingSessionResponse
} from "@/lib/reports/api";

async function handlePdf(request: Request, context: { params: Promise<{ id: string }> }) {
  const requestContext = await getRequestContext(request);
  const sessionId = getClientSessionId(request) || new URL(request.url).searchParams.get("session") || "";
  if (!requestContext && !sessionId) return missingSessionResponse();

  const { id } = await context.params;
  const { data, error } = requestContext
    ? await getShiftReportForContext(id, requestContext)
    : await getShiftReportForSession(id, sessionId);
  if (error || !data) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const report = data as unknown as {
    participant_name: string;
    report_date: string;
    staff_name: string;
    start_time?: string | null;
    end_time?: string | null;
    final_report?: string | null;
    signature?: string | null;
    time_completed?: string | null;
  };

  const pdf = createReportPdf({
    companyName: requestContext?.profile?.company?.name || "SupportNote AI Demo Company",
    reportType: "Shift Report",
    participant: report.participant_name,
    date: report.report_date,
    staff: report.staff_name,
    timeLabel: "Shift time",
    timeValue: `${report.start_time || "Not recorded"} - ${report.end_time || "Not recorded"}`,
    content: report.final_report || "No report content saved.",
    signature: report.signature,
    timeCompleted: report.time_completed
  });

  return pdfResponse(pdf, `shift-report-${id}.pdf`);
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return handlePdf(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handlePdf(request, context);
}
