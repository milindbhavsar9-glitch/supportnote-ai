import Link from "next/link";
import { AlertTriangle, ClipboardCheck, Clock, FileText, Search, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { title: "Create Shift Report", href: "/reports/shift/new", icon: ClipboardCheck },
  { title: "Create Incident Report", href: "/reports/incident/new", icon: FileText },
  { title: "My Draft Reports", href: "/reports?status=draft", icon: Clock },
  { title: "Completed Reports", href: "/reports?status=completed", icon: ClipboardCheck },
  { title: "Search Records", href: "/reports", icon: Search },
  { title: "Subscription Status", href: "/settings/billing", icon: WalletCards }
];

const reports = [
  ["Alex M.", "Shift", "Today", "Draft", ""],
  ["Taylor R.", "Incident", "Yesterday", "Submitted", "Incident flag"],
  ["Jordan K.", "Shift", "May 14", "Completed", "Medication issue"]
];

export default function DashboardPage() {
  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Create reports, continue drafts, and review recent records.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="h-full transition hover:border-primary">
              <CardContent className="p-5">
                <card.icon className="h-7 w-7 text-primary" />
                <p className="mt-4 font-semibold">{card.title}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2">Participant</th>
                  <th>Report type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.join("-")} className="border-t">
                    <td className="py-3 font-medium">{report[0]}</td>
                    <td>{report[1]}</td>
                    <td>{report[2]}</td>
                    <td>{report[3]}</td>
                    <td>
                      {report[4] ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                          <AlertTriangle className="h-3 w-3" />
                          {report[4]}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
