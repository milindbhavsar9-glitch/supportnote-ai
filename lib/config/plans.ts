export type PlanId = "free_trial" | "solo_worker" | "small_team";

export type PlanLimit = {
  id: PlanId;
  name: string;
  price: string;
  description: string;
  cta: string;
  limits: {
    users: number;
    shiftReports: number | null;
    incidentReports: number | null;
    aiGenerations: number;
    trialDays?: number;
  };
  features: string[];
};

export const plans: PlanLimit[] = [
  {
    id: "free_trial",
    name: "Free Trial",
    price: "$0",
    description: "Try the core report workflow with no payment required.",
    cta: "Start Free Trial",
    limits: {
      users: 1,
      shiftReports: 5,
      incidentReports: 1,
      aiGenerations: 3,
      trialDays: 7
    },
    features: [
      "7 day access",
      "5 shift reports",
      "1 incident report",
      "3 AI generations",
      "Single user only"
    ]
  },
  {
    id: "solo_worker",
    name: "Solo Worker",
    price: "AUD $12.99/mo",
    description: "For individual workers who need fast, clear shift notes and incident records.",
    cta: "Choose Solo",
    limits: {
      users: 1,
      shiftReports: 100,
      incidentReports: 20,
      aiGenerations: 100
    },
    features: [
      "100 shift reports per month",
      "20 incident reports per month",
      "100 AI generations per month",
      "Copy report",
      "PDF export",
      "Save and search records"
    ]
  },
  {
    id: "small_team",
    name: "Small Team",
    price: "AUD $49/mo",
    description: "For small workplace teams that need shared reporting, review, and records.",
    cta: "Choose Team",
    limits: {
      users: 5,
      shiftReports: null,
      incidentReports: null,
      aiGenerations: 1000
    },
    features: [
      "Up to 5 staff users",
      "Company dashboard",
      "Person/area and staff lists",
      "Admin review",
      "Late report tracking",
      "Incident flags",
      "1,000 AI generations per month"
    ]
  }
];
