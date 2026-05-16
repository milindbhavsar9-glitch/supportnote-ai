import { z } from "zod";

export const shiftReportFormSchema = z.object({
  participantName: z.string().min(1, "Participant name is required"),
  reportDate: z.string().min(1, "Date is required"),
  shiftType: z.string().optional().default(""),
  staffName: z.string().min(1, "Staff name is required"),
  startTime: z.string().optional().default(""),
  endTime: z.string().optional().default(""),
  handoverTime: z.string().optional().default(""),
  handoverFrom: z.string().optional().default(""),
  handoverKeyIssues: z.string().optional().default(""),
  locationFrom: z.string().optional().default(""),
  locationTo: z.string().optional().default(""),
  location: z.string().optional().default(""),
  staffPresent: z.string().optional().default("Yes"),
  locationNotes: z.string().optional().default(""),
  oneToOneSupport: z.string().optional().default(""),
  lineOfSightMaintained: z.string().optional().default(""),
  participantUnsupervised: z.string().optional().default(""),
  locationUnknown: z.string().optional().default(""),
  lineOfSightExplain: z.string().optional().default(""),
  medicationStatus: z.string().optional().default(""),
  medicationReason: z.string().optional().default(""),
  medicationSupervisorNotified: z.string().optional().default(""),
  medicationFollowUp: z.string().optional().default(""),
  breakfast: z.string().optional().default(""),
  lunch: z.string().optional().default(""),
  dinner: z.string().optional().default(""),
  snacks: z.string().optional().default(""),
  fluids: z.string().optional().default(""),
  mealNotes: z.string().optional().default(""),
  positiveBehaviours: z.array(z.string()).optional().default([]),
  challengingBehaviours: z.array(z.string()).optional().default([]),
  triggers: z.string().optional().default(""),
  deEscalation: z.array(z.string()).optional().default([]),
  incidentOccurred: z.string().optional().default("None"),
  incidentType: z.string().optional().default(""),
  incidentDescription: z.string().optional().default(""),
  immediateAction: z.string().optional().default(""),
  witnesses: z.string().optional().default(""),
  supervisorNotified: z.string().optional().default(""),
  guardianNotified: z.string().optional().default(""),
  reportFiled: z.string().optional().default(""),
  reportNumber: z.string().optional().default(""),
  clientQuote: z.string().optional().default(""),
  supportProvided: z.array(z.string()).optional().default([]),
  mood: z.string().optional().default(""),
  engagement: z.string().optional().default(""),
  sleep: z.string().optional().default(""),
  handoverNotes: z.string().optional().default(""),
  followUpOn: z.array(z.string()).optional().default([]),
  otherObservations: z.string().optional().default(""),
  aiReviewedText: z.string().optional().default(""),
  confirmation: z.boolean().optional().default(false),
  signature: z.string().optional().default(""),
  timeCompleted: z.string().optional().default(""),
  clientSessionId: z.string().min(8)
});

export type ShiftReportForm = z.infer<typeof shiftReportFormSchema>;

export const defaultShiftReportForm: ShiftReportForm = {
  participantName: "",
  reportDate: new Date().toISOString().slice(0, 10),
  shiftType: "Day",
  staffName: "",
  startTime: "",
  endTime: "",
  handoverTime: "",
  handoverFrom: "",
  handoverKeyIssues: "",
  locationFrom: "",
  locationTo: "",
  location: "Home",
  staffPresent: "Yes",
  locationNotes: "",
  oneToOneSupport: "",
  lineOfSightMaintained: "",
  participantUnsupervised: "",
  locationUnknown: "",
  lineOfSightExplain: "",
  medicationStatus: "",
  medicationReason: "",
  medicationSupervisorNotified: "",
  medicationFollowUp: "",
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: "",
  fluids: "",
  mealNotes: "",
  positiveBehaviours: [],
  challengingBehaviours: [],
  triggers: "",
  deEscalation: [],
  incidentOccurred: "None",
  incidentType: "",
  incidentDescription: "",
  immediateAction: "",
  witnesses: "",
  supervisorNotified: "",
  guardianNotified: "",
  reportFiled: "",
  reportNumber: "",
  clientQuote: "",
  supportProvided: [],
  mood: "",
  engagement: "",
  sleep: "",
  handoverNotes: "",
  followUpOn: [],
  otherObservations: "",
  aiReviewedText: "",
  confirmation: false,
  signature: "",
  timeCompleted: "",
  clientSessionId: "pending"
};

function value(text?: string | null) {
  return text?.trim() ? text.trim() : "Not recorded";
}

function list(items: string[]) {
  return items.length ? items.join(", ") : "None recorded";
}

export function buildShiftReportText(form: ShiftReportForm) {
  const quote = form.clientQuote.trim()
    ? `"${form.clientQuote.trim().replace(/^["']|["']$/g, "")}"`
    : "Not recorded";

  return `SHIFT REPORT

Participant: ${value(form.participantName)}
Date: ${value(form.reportDate)}
Shift: ${value(form.shiftType)}
Staff: ${value(form.staffName)}
Start: ${value(form.startTime)}
End: ${value(form.endTime)}

1. Handover Received
Time: ${value(form.handoverTime)}
From: ${value(form.handoverFrom)}
Key issues: ${value(form.handoverKeyIssues)}

2. Participant Location Timeline
Time from: ${value(form.locationFrom)}
Time to: ${value(form.locationTo)}
Location: ${value(form.location)}
Staff present: ${value(form.staffPresent)}
Notes: ${value(form.locationNotes)}

3. Line of Sight / Supervision
1:1 support: ${value(form.oneToOneSupport)}
Line of sight maintained: ${value(form.lineOfSightMaintained)}
Participant unsupervised: ${value(form.participantUnsupervised)}
Participant location unknown: ${value(form.locationUnknown)}
Explanation: ${value(form.lineOfSightExplain)}

4. Medication
Medication status: ${value(form.medicationStatus)}
Reason: ${value(form.medicationReason)}
Supervisor notified: ${value(form.medicationSupervisorNotified)}
Follow-up required: ${value(form.medicationFollowUp)}

5. Meals and Fluids
Breakfast: ${value(form.breakfast)}
Lunch: ${value(form.lunch)}
Dinner: ${value(form.dinner)}
Snacks: ${value(form.snacks)}
Fluids: ${value(form.fluids)}
Notes: ${value(form.mealNotes)}

6. Behaviour
Positive behaviour: ${list(form.positiveBehaviours)}
Challenging behaviour: ${list(form.challengingBehaviours)}
Triggers: ${value(form.triggers)}
De-escalation used: ${list(form.deEscalation)}

7. Incidents
Incident occurred: ${value(form.incidentOccurred)}
Incident type: ${value(form.incidentType)}
Brief description: ${value(form.incidentDescription)}
Immediate action taken: ${value(form.immediateAction)}
Witnesses: ${value(form.witnesses)}
Supervisor notified: ${value(form.supervisorNotified)}
Family / guardian notified: ${value(form.guardianNotified)}
Report filed: ${value(form.reportFiled)}
Report number: ${value(form.reportNumber)}

8. Client Concerns
Client said: ${quote}

9. Support Provided
${list(form.supportProvided)}

10. Mood and Engagement
Mood: ${value(form.mood)}
Engagement: ${value(form.engagement)}
Sleep past 24 hours: ${value(form.sleep)}

11. Handover to Next Shift
Handover notes: ${value(form.handoverNotes)}
Follow-up on: ${list(form.followUpOn)}

12. Other Observations
${value(form.otherObservations)}

AI reviewed text: ${value(form.aiReviewedText)}

13. Follow-up Required
${list(form.followUpOn)}

14. Staff Confirmation
Confirmed complete and accurate: ${form.confirmation ? "Yes" : "No"}

Signature: ${value(form.signature)}
Time completed: ${value(form.timeCompleted)}`;
}

export function getShiftReportFlags(form: ShiftReportForm) {
  const incidentFlag = form.incidentOccurred === "Yes" || Boolean(form.incidentType);
  const medicationIssueFlag = ["Refused", "Held"].includes(form.medicationStatus);
  const behaviourIssueFlag = form.challengingBehaviours.length > 0;
  const lineOfSightIssueFlag =
    form.lineOfSightMaintained === "No" ||
    form.participantUnsupervised === "Yes" ||
    form.locationUnknown === "Yes";

  return {
    incidentFlag,
    medicationIssueFlag,
    behaviourIssueFlag,
    lineOfSightIssueFlag,
    supervisorNotified:
      form.supervisorNotified === "Yes" || form.medicationSupervisorNotified === "Yes"
  };
}
