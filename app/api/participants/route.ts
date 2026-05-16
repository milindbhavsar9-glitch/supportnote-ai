import { NextResponse } from "next/server";
import { z } from "zod";
import { demoReference } from "@/lib/admin/demo-admin";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const participantSchema = z.object({
  displayName: z.string().min(1),
  referenceCode: z.string().optional().default(""),
  notes: z.string().optional().default("")
});

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .select("id, display_name, reference_code, notes, is_active, created_at")
      .eq("reference_code", demoReference("participant", sessionId))
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ participants: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load participants." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const parsed = participantSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Participant display name is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .insert({
        display_name: parsed.data.displayName,
        reference_code: demoReference("participant", sessionId),
        notes: JSON.stringify({
          demo_record_type: "participant",
          reference_code: parsed.data.referenceCode,
          notes: parsed.data.notes
        })
      })
      .select("id, display_name, reference_code, notes, is_active, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ participant: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create participant." },
      { status: 500 }
    );
  }
}
