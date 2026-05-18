"use client";

import { useEffect, useState } from "react";
import { Brain, ClipboardCopy, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_REVIEW_DISCLAIMER, aiWritingOptions, type AIWritingOptionId } from "@/lib/ai/options";
import { isBillingEnabled } from "@/lib/config/billing";

type AIWritingHelperProps = {
  reportType: "shift" | "incident";
  sourceText: string;
  clientSessionId: string;
  reportId?: string;
  onApply: (text: string) => void;
};

type Usage = {
  aiGenerationsUsed: number;
  aiGenerationsLimit: number;
};

export function AIWritingHelper({
  reportType,
  sourceText,
  clientSessionId,
  reportId,
  onApply
}: AIWritingHelperProps) {
  const billingEnabled = isBillingEnabled();
  const [selectedOption, setSelectedOption] = useState<AIWritingOptionId>(aiWritingOptions[0].id);
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [usage, setUsage] = useState<Usage>({
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 3
  });

  useEffect(() => {
    if (!clientSessionId || clientSessionId === "pending") return;

    async function loadUsage() {
      const response = await fetch("/api/ai/usage", {
        headers: { "x-supportnote-session": clientSessionId }
      });

      if (!response.ok) return;
      const data = (await response.json()) as Usage;
      setUsage(data);
    }

    void loadUsage();
  }, [clientSessionId]);

  async function generateText() {
    if (!clientSessionId || clientSessionId === "pending") {
      setMessage("Demo session is still loading. Please try again in a moment.");
      return;
    }

    setIsGenerating(true);
    setMessage("AI is preparing a draft...");

    const response = await fetch("/api/ai/generate-report", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-supportnote-session": clientSessionId
      },
      body: JSON.stringify({
        reportType,
        action: selectedOption,
        sourceText,
        clientSessionId,
        reportId: reportId || undefined
      })
    });

    const data = (await response.json()) as {
      text?: string;
      error?: string;
      usage?: Usage;
    };

    setIsGenerating(false);

    if (!response.ok) {
      setMessage(data.error || "AI helper could not generate text.");
      return;
    }

    setOutput(data.text || "");
    if (data.usage) setUsage(data.usage);
    setMessage("AI draft ready. Review and edit before saving.");
  }

  async function copyText() {
    if (!output.trim()) return;
    await navigator.clipboard.writeText(output);
    setMessage("AI text copied.");
  }

  function applyText() {
    if (!output.trim()) {
      setMessage("Generate or type AI reviewed text first.");
      return;
    }

    onApply(output.trim());
    setMessage("AI reviewed text added to the report. Save the draft to store it.");
  }

  const usageLimitReached = billingEnabled && usage.aiGenerationsUsed >= usage.aiGenerationsLimit;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Help Me Write
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          {AI_REVIEW_DISCLAIMER}
        </div>

        <div className="grid gap-2">
          {aiWritingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm font-semibold ${
                selectedOption === option.id
                  ? "border-primary bg-secondary text-primary"
                  : "bg-white hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {billingEnabled
              ? `AI usage: ${usage.aiGenerationsUsed} / ${usage.aiGenerationsLimit}`
              : "AI access is enabled for internal testing."}
          </p>
          <Button
            type="button"
            onClick={() => void generateText()}
            disabled={isGenerating || usageLimitReached}
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate
          </Button>
        </div>

        {usageLimitReached ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-950">
            AI generation limit reached.
          </p>
        ) : null}

        <label className="space-y-2 text-sm font-medium">
          <span>Editable AI draft</span>
          <textarea
            value={output}
            onChange={(event) => setOutput(event.target.value)}
            rows={9}
            className="w-full rounded-md border bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            placeholder="AI output will appear here. You can edit it before adding it to the report."
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={() => void copyText()}>
            <ClipboardCopy className="h-4 w-4" />
            Copy AI Text
          </Button>
          <Button type="button" variant="accent" onClick={applyText}>
            Add To Report
          </Button>
        </div>

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
