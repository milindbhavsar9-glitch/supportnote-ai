import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <h1 className="text-3xl font-bold tracking-tight">Search Records</h1>
      <p className="mt-2 text-muted-foreground">Filter previous reports by participant, staff, date range, type, status, and risk flags.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {["Participant", "Staff", "Report type", "Status", "Incident type", "Date range"].map((field) => (
            <input key={field} className="h-11 rounded-md border px-3" placeholder={field} />
          ))}
          <Button>Search</Button>
        </CardContent>
      </Card>
    </div>
  );
}
