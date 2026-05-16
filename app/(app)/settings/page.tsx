import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card className="mt-6 max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <input className="h-11 rounded-md border px-3" placeholder="Full name" />
          <input className="h-11 rounded-md border px-3" placeholder="Email" />
        </CardContent>
      </Card>
    </div>
  );
}
