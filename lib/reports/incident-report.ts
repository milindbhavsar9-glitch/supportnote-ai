import { z } from "zod";

export const incidentReportFormSchema = z.object({
  participantName: z.string().min(1, "Participant name is required"),
  incidentDate: z.string().min(1, "Date is required"),
  incidentTime: z.string().optional().default(""),
  location: z.string().min(1, "Location is required"),
  staffName: z.string().min(1, "Report completed by is required"),
  staffPresent: z.string().optional().default(""),
  otherPeopleInvolved: z.string().optional().default(""),
  witnesses: z.string().optional().default(""),
  incidentType: z.string().min(1, "Incident type is required"),
  beforeIncident: z.string().optional().default(""),
  duringIncident: z.string().optional().default(""),
  afterIncident: z.string().optional().default(""),
  exactWords: z.string().optional().default(""),
  injuriesObserved: z.string().optional().default(""),
  firstAidProvided: z.string().optional().default(""),
  emergencyServicesContacted: z.string().optional().default("No"),
  supervisorNotified: z.string().optional().default("No"),
  familyGuardianNotified: z.string().optional().default("Not required"),
  followUpRequired: z.string().optional().default(""),
  lineOfSightMaintained: z.string().optional().default(""),
  participantLocationUnknown: z.string().optional().default(""),
  participantUnsupervised: z.string().optional().default(""),
  immediateSafetyActions: z.string().optional().default(""),
  aiReviewedText: z.string().optional().default(""),
  signature: z.string().optional().default(""),
  timeCompleted: z.string().optional().default(""),
  clientSessionId: z.string().min(8)
});

export type IncidentReportForm = z.infer<typeof incidentReportFormSchema>;

export const defaultIncidentReportForm: IncidentReportForm = {
  participantName: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: "",
  location: "",
  staffName: "",
  staffPresent: "",
  otherPeopleInvolved: "",
  witnesses: "",
  incidentType: "",
  beforeIncident: "",
  duringIncident: "",
  afterIncident: "",
  exactWords: "",
  injuriesObserved: "",
  firstAidProvided: "",
  emergencyServicesContacted: "No",
  supervisorNotified: "No",
  familyGuardianNotified: "Not required",
  followUpRequired: "",
  lineOfSightMaintained: "",
  participantLocationUnknown: "",
  participantUnsupervised: "",
  immediateSafetyActions: "",
  aiReviewedText: "",
  signature: "",
  timeCompleted: "",
  clientSessionId: "pending"
};

function value(text?: string | null) {
  return text?.trim() ? text.trim() : "Not recorded";
}

export function getIncidentReportFlags(form: IncidentReportForm) {
  const injuryFlag = Boolean(
    form.injuriesObserved.trim() ||
      ["Fall", "Injury", "Self-harm", "Physical aggression"].includes(form.incidentType)
  );
  const lineOfSightIssueFlag =
    form.incidentType === "Missing participant" ||
    form.incidentType === "Location unknown" ||
    form.lineOfSightMaintained === "No" ||
    form.participantLocationUnknown === "Yes" ||
    form.participantUnsupervised === "Yes";

  return {
    injuryFlag,
    lineOfSightIssueFlag,
    supervisorNotified: form.supervisorNotified === "Yes",
    emergencyServicesContacted: form.emergencyServicesContacted === "Yes"
  };
}

export function buildIncidentReportText(form: IncidentReportForm) {
  const exactWords = form.exactWords.trim()
    ? `"${form.exactWords.trim().replace(/^["']|["']$/g, "")}"`
    : "Not recorded";

  return `INCIDENT REPORT

Participant: ${value(form.participantName)}
Date of incident: ${value(form.incidentDate)}
Time of incident: ${value(form.incidentTime)}
Location: ${value(form.location)}
Staff present: ${value(form.staffPresent)}
Other people involved: ${value(form.otherPeopleInvolved)}
Witnesses: ${value(form.witnesses)}
Incident type: ${value(form.incidentType)}

1. What happened before the incident?
${value(form.beforeIncident)}

2. What happened during the incident?
${value(form.duringIncident)}

3. What happened after the incident?
${value(form.afterIncident)}

4. Exact words spoken, if relevant
${exactWords}

5. Injuries Observed
${value(form.injuriesObserved)}

6. First Aid Provided
${value(form.firstAidProvided)}

7. Notifications and Safety Actions
Emergency services contacted: ${value(form.emergencyServicesContacted)}
Supervisor notified: ${value(form.supervisorNotified)}
Family / guardian notified: ${value(form.familyGuardianNotified)}
Immediate safety actions: ${value(form.immediateSafetyActions)}

8. Line of Sight / Location Concerns
Line of sight maintained: ${value(form.lineOfSightMaintained)}
Participant location unknown: ${value(form.participantLocationUnknown)}
Participant unsupervised: ${value(form.participantUnsupervised)}

9. Follow-up Required
${value(form.followUpRequired)}

10. AI Reviewed Text
${value(form.aiReviewedText)}

Report completed by: ${value(form.staffName)}
Signature: ${value(form.signature)}
Time completed: ${value(form.timeCompleted)}`;
}
