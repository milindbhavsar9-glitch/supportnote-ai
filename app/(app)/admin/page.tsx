import { AlertTriangle, ClipboardList, FileWarning, Pill, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  ["Total reports this week", "42", ClipboardList],
  ["Draft reports", "8", ClipboardList],
  ["Late reports", "3", AlertTriangle],
  ["Incident reports", "5", FileWarning],
  ["Reports needing review", "7", Users],
  ["Medication issues", "2", Pill],
  ["Line of sight issues", "1", AlertTriangle]
];

export default function AdminPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Company Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Review team reports, compliance flags, participants, and staff activity.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
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
          <CardTitle>Reports needing review</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Incident review, comments, staff compliance summary, and late report tracking will connect to Supabase in Phase 6.
        </CardContent>
      </Card>
    </div>
  );
}
