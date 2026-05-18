import Link from "next/link";
import {
  Brain,
  CheckSquare,
  ClipboardCopy,
  FileDown,
  FileText,
  Lock,
  Smartphone,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { title: "Easy tick-box shift reports", icon: CheckSquare },
  { title: "Incident note builder", icon: FileText },
  { title: "AI writing help", icon: Brain },
  { title: "Copy report in one click", icon: ClipboardCopy },
  { title: "PDF export", icon: FileDown },
  { title: "Save report records", icon: Search },
  { title: "Mobile friendly", icon: Smartphone },
  { title: "Built for workplace teams", icon: Lock }
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
              SupportNote AI
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create clear shift reports and incident notes in minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              SupportNote AI helps staff prepare clear, factual, and professional
              notes using easy tick boxes and AI writing help.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-lg border bg-secondary/60 p-4">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shift Report</p>
                  <p className="font-semibold">Section 3 of 12</p>
                </div>
                <span className="rounded-md bg-accent px-3 py-1 text-xs font-bold">
                  Saved automatically
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-1/3 rounded-full bg-primary" />
              </div>
              <div className="mt-6 space-y-3">
                {[
                  "Was this 1:1 support?",
                  "Was visibility maintained?",
                  "Was the person or area ever unattended?"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border p-4">
                    <CheckSquare className="h-6 w-6 text-primary" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Use this section to record visibility, supervision, and safety
                checks where they are required by your workplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Problem</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Workers often need to write clear notes after long shifts, under time
              pressure, and sometimes without strong confidence in written English.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              SupportNote AI turns tick boxes, short notes, and incident details
              into clear draft reports that workers can review, edit, save, copy,
              and export.
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Features</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-5">
                  <feature.icon className="h-7 w-7 text-primary" />
                  <p className="mt-4 font-semibold">{feature.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            "Choose shift report or incident note",
            "Complete simple tick boxes and short notes",
            "Review, copy, save, or export the final report"
          ].map((step, index) => (
            <Card key={step}>
              <CardContent className="p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 font-semibold">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Privacy and security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>Login is required for reports, with tenant isolation and Row Level Security planned from the first database migration.</p>
              <p>No OpenAI or Stripe secret keys are exposed to the browser.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Does AI submit reports automatically?</strong> No. Workers review and edit AI-generated text before saving or submitting.</p>
              <p><strong className="text-foreground">Can teams review reports?</strong> Yes. Small Team includes admin review, comments, and workplace flags.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
