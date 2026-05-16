export const AI_REVIEW_DISCLAIMER =
  "AI-generated text must be reviewed before saving or submitting.";

export const DEMO_AI_GENERATION_LIMIT = 3;

export const aiWritingOptions = [
  {
    id: "full_professional_report",
    label: "Generate full professional report",
    prompt:
      "Create a full professional report from the provided report details. Keep it factual, respectful, objective, and easy to understand."
  },
  {
    id: "short_handover_summary",
    label: "Generate short handover summary",
    prompt:
      "Create a short handover summary from the provided report details. Include only key information for the next worker."
  },
  {
    id: "incident_factual_summary",
    label: "Generate incident-style factual summary",
    prompt:
      "Create a factual incident-style summary. Use a clear before, during, after structure where the information is available."
  },
  {
    id: "fix_grammar",
    label: "Fix grammar only",
    prompt:
      "Fix grammar, spelling, and punctuation only. Do not change the meaning or add new information."
  },
  {
    id: "make_professional",
    label: "Make it more professional",
    prompt:
      "Rewrite the text in professional support-work language while keeping the same facts and meaning."
  },
  {
    id: "make_shorter",
    label: "Make it shorter",
    prompt:
      "Shorten the text while keeping the important facts, risks, actions taken, and follow-up information."
  },
  {
    id: "dot_points_to_report",
    label: "Convert dot points into report",
    prompt:
      "Convert the provided dot points into a professional report paragraph or short report section. Do not invent details."
  }
] as const;

export type AIWritingOptionId = (typeof aiWritingOptions)[number]["id"];

export function getAIWritingOption(id: string) {
  return aiWritingOptions.find((option) => option.id === id);
}
