import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/auth/request-context";
import { canOpenAdmin } from "@/lib/auth/roles";
import { demoReference } from "@/lib/admin/demo-admin";
import { missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const participantSchema = z.object({
  displayName: z.string().min(1),
  referenceCode: z.string().optional().default(""),
  notes: z.string().optional().default("")
});

export async function GET(request: Request) {
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();

  try {
    const supabase = getSupabaseAdmin();
    const query = supabase
      .from("participants")
      .select("id, display_name, reference_code, notes, is_active, created_at")
      .order("created_at", { ascending: false });
    const { data, error } =
      context.mode === "auth" && context.profile.company_id
        ? await query.eq("company_id", context.profile.company_id)
        : await query.eq("reference_code", demoReference("participant", context.sessionId));

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
  const context = await getRequestContext(request);
  if (!context) return missingSessionResponse();

  const parsed = participantSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Participant display name is required." }, { status: 400 });
  }

  try {
    if (context.mode === "auth" && !canOpenAdmin(context.profile.role)) {
      return NextResponse.json({ error: "Only team leaders and company admins can manage participants." }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .insert({
        company_id: context.mode === "auth" ? context.profile.company_id : null,
        created_by: context.mode === "auth" ? context.profile.id : null,
        display_name: parsed.data.displayName,
        reference_code:
          context.mode === "auth"
            ? parsed.data.referenceCode || null
            : demoReference("participant", context.sessionId),
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
