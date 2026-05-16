export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function Field({
  label,
  placeholder,
  type = "text"
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border bg-white px-3 text-base outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

export function TextAreaField({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <textarea
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-md border bg-white px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

export function CheckboxPill({ label }: { label: string }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-md border bg-white px-4 py-3 text-sm font-medium">
      <input type="checkbox" className="h-5 w-5 accent-primary" />
      <span>{label}</span>
    </label>
  );
}
