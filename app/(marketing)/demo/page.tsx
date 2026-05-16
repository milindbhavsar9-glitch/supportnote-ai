import Link from "next/link";
import { AlertTriangle, ClipboardCheck, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sampleReports = [
  ["Alex M.", "Shift", "Completed", "No incident"],
  ["Taylor R.", "Incident", "Needs review", "Location unknown"],
  ["Jordan K.", "Shift", "Draft", "Medication issue"]
];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Demo mode</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Fake data, real workflow preview.</h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Demo mode uses sample participants and reports only. Do not enter real
            participant information here.
          </p>
        </div>
        <Button asChild>
          <Link href="/signup">Start Free Trial</Link>
        </Button>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-4">
        {[
          ["Total reports this week", "18", ClipboardCheck],
          ["Late reports", "2", AlertTriangle],
          ["Incident reports", "3", FileText],
          ["Staff users", "5", Users]
        ].map(([label, value, Icon]) => (
          <Card key={String(label)}>
            <CardContent className="p-5">
              <Icon className="h-6 w-6 text-primary" />
              <p className="mt-4 text-3xl font-bold">{value as string}</p>
              <p className="text-sm text-muted-foreground">{label as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sample recent reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2">Participant</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {sampleReports.map((row) => (
                  <tr key={row.join("-")} className="border-t">
                    {row.map((cell) => (
                      <td key={cell} className="py-3 font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
