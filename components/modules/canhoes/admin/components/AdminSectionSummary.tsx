import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminSectionSummary({
  description,
  items,
  kicker,
  title,
}: Readonly<{
  description: string;
  items: ReadonlyArray<{
    label: string;
    tone?: "default" | "highlight" | "muted" | "success" | "warning";
    value: number | string;
  }>;
  kicker: string;
  title: string;
}>) {
  return (
    <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
      <CardHeader className="space-y-2">
        <p className="editorial-kicker">{kicker}</p>
        <CardTitle>{title}</CardTitle>
        <p className="body-small max-w-[68ch] text-[var(--color-text-muted)]">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] px-3 py-3",
                item.tone === "highlight"
                  ? "bg-gradient-to-r from-[rgba(177,140,255,0.08)] to-transparent"
                  : item.tone === "success"
                    ? "bg-[rgba(97,220,168,0.08)]"
                    : item.tone === "warning"
                      ? "bg-[rgba(253,224,71,0.08)]"
                      : "bg-[rgba(11,14,8,0.46)]"
              )}
            >
              <div className="space-y-1">
                <p className="text-xs text-[var(--color-text-muted)]">{item.label}</p>
                <p
                  className={cn(
                    "heading-4",
                    item.tone === "highlight"
                      ? "text-[var(--color-accent)]"
                      : item.tone === "success"
                        ? "text-[var(--color-success)]"
                        : item.tone === "warning"
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--bg-paper)]"
                  )}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
