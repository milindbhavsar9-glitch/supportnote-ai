import { supportNoteSystemInstruction } from "@/lib/ai/instructions";
import { ok } from "@/lib/http";

export async function POST() {
  return ok(
    {
      status: "planned",
      systemInstruction: supportNoteSystemInstruction,
      disclaimer: "AI-generated text must be reviewed before saving or submitting."
    },
    { status: 202 }
  );
}
