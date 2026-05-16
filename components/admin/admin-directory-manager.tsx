"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDemoSessionId } from "@/lib/reports/demo-session";

type DirectoryMode = "staff" | "participants";

type DirectoryRecord = {
  id: string;
  display_name: string;
  reference_code?: string;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
};

export function AdminDirectoryManager({ mode }: { mode: DirectoryMode }) {
  const [sessionId, setSessionId] = useState("");
  const [records, setRecords] = useState<DirectoryRecord[]>([]);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Support Worker");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");

  const isStaff = mode === "staff";
  const title = isStaff ? "Staff Management" : "Participant Management";
  const endpoint = isStaff ? "/api/admin/staff" : "/api/participants";

  useEffect(() => {
    setSessionId(getDemoSessionId());
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    void loadRecords();
    // Load once when the demo session is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function loadRecords() {
    const response = await fetch(endpoint, {
      headers: { "x-supportnote-session": sessionId }
    });
    const data = (await response.json()) as {
      staff?: DirectoryRecord[];
      participants?: DirectoryRecord[];
      error?: string;
    };

    if (!response.ok) {
      setMessage(data.error || "Could not load records.");
      return;
    }

    setRecords(isStaff ? data.staff ?? [] : data.participants ?? []);
  }

  async function addRecord() {
    if (!name.trim()) {
      setMessage(isStaff ? "Add staff name first." : "Add participant name first.");
      return;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": sessionId
      },
      body: JSON.stringify(
        isStaff
          ? { name, role, email, phone }
          : { displayName: name, referenceCode, notes }
      )
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(data.error || "Could not save record.");
      return;
    }

    setName("");
    setRole("Support Worker");
    setEmail("");
    setPhone("");
    setReferenceCode("");
    setNotes("");
    setMessage(isStaff ? "Staff member added." : "Participant added.");
    await loadRecords();
  }

  return (
    <div className="pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">
            Demo records are saved in Supabase using fake data only until real team login is connected.
          </p>
        </div>
        <Button asChild variant="outline"><Link href="/admin">Back to Admin</Link></Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add {isStaff ? "staff" : "participant"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              <span>{isStaff ? "Staff name" : "Participant display name"}</span>
              <input className="h-11 w-full rounded-md border px-3" value={name} onChange={(event) => setName(event.target.value)} />
            </label>

            {isStaff ? (
              <>
                <label className="space-y-2 text-sm font-medium">
                  <span>Role</span>
                  <select className="h-11 w-full rounded-md border px-3" value={role} onChange={(event) => setRole(event.target.value)}>
                    <option>Support Worker</option>
                    <option>Team Leader</option>
                    <option>Company Admin</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Email</span>
                  <input className="h-11 w-full rounded-md border px-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Phone</span>
                  <input className="h-11 w-full rounded-md border px-3" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </label>
              </>
            ) : (
              <>
                <label className="space-y-2 text-sm font-medium">
                  <span>Reference code</span>
                  <input className="h-11 w-full rounded-md border px-3" value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Notes</span>
                  <textarea className="w-full rounded-md border px-3 py-3" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
                </label>
              </>
            )}

            <Button className="w-full" onClick={() => void addRecord()}>
              Add {isStaff ? "Staff" : "Participant"}
            </Button>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Saved {isStaff ? "staff" : "participants"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved records yet.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {records.map((record) => (
                  <div key={record.id} className="rounded-md border bg-white p-4">
                    <p className="font-semibold">{record.display_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{renderNotes(record.notes)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Added {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function renderNotes(notes?: string | null) {
  if (!notes) return "No extra details";

  try {
    const parsed = JSON.parse(notes) as Record<string, string>;
    return Object.entries(parsed)
      .filter(([key, value]) => key !== "demo_record_type" && Boolean(value))
      .map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`)
      .join(" | ") || "No extra details";
  } catch {
    return notes;
  }
}
