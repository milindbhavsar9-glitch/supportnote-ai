import { NextResponse } from "next/server";
import { z } from "zod";
import { demoReference } from "@/lib/admin/demo-admin";
import { getClientSessionId, missingSessionResponse } from "@/lib/reports/api";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const staffSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default("Support Worker"),
  email: z.string().optional().default(""),
  phone: z.string().optional().default("")
});

export async function GET(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .select("id, display_name, notes, is_active, created_at")
      .eq("reference_code", demoReference("staff", sessionId))
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return NextResponse.json({ staff: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load staff." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionId = getClientSessionId(request);
  if (!sessionId) return missingSessionResponse();

  const parsed = staffSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Staff name is required." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("participants")
      .insert({
        display_name: parsed.data.name,
        reference_code: demoReference("staff", sessionId),
        notes: JSON.stringify({
          demo_record_type: "staff",
          role: parsed.data.role,
          email: parsed.data.email,
          phone: parsed.data.phone
        })
      })
      .select("id, display_name, notes, is_active, created_at")
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ staff: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create staff." },
      { status: 500 }
    );
  }
}
