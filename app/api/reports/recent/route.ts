import { ok } from "@/lib/http";

export async function GET() {
  return ok({
    reports: [
      {
        participantName: "Alex M.",
        reportType: "shift",
        date: new Date().toISOString(),
        status: "draft",
        incidentFlag: false
      }
    ]
  });
}
