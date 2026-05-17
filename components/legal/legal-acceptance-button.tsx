"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LegalAcceptanceButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function accept() {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/legal/accept-current", { method: "POST" });
    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setMessage(data.error || "Could not record acceptance.");
      return;
    }

    setMessage("Current policies accepted.");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button disabled={loading} onClick={() => void accept()} type="button" variant="outline">
        {loading ? "Recording..." : "Accept current policies"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
