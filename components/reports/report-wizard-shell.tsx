import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportWizardShell({
  title,
  description,
  stepLabel,
  children
}: {
  title: string;
  description: string;
  stepLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl pb-24">
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">{stepLabel}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Report details</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-3 lg:left-64">
        <div className="mx-auto flex max-w-4xl gap-2">
          <Button variant="outline" className="flex-1">Save Draft</Button>
          <Button variant="secondary" className="flex-1">AI Help</Button>
          <Button className="flex-1">Preview</Button>
        </div>
      </div>
    </div>
  );
}
