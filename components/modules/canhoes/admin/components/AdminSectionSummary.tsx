import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Summary section for displaying statistics and counts.
 * Matches the dark paper theme with moose-inspired border colors.
 * Used for proposal counts, phase summaries, and other admin metrics.
 *
 * @param description - Brief description of the summary section
 * @param items - Array of stat items with label, value, and optional tone styling
 * @param kicker - Short label above the title (editorial kicker style)
 * @param title - Main title for the summary section
 * @example
 * ```tsx
 * <AdminSectionSummary
 *   kicker="Visao geral"
 *   title="Resumo da edicao"
 *   description="Acompanhe o progresso das propostas por fase."
 *   items={[
 *     { label: "Propostas aprovadas", value: 23, tone: "success" },
 *     { label: "Propostas pendentes", value: 8, tone: "warning" },
 *   ]}
 * />
 * ```
 */
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
        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-[rgba(212,184,150,0.12)] px-3 py-2 ${
              item.tone === "highlight"
                ? "bg-gradient-to-r from-[rgba(177,140,255,0.08)] to-transparent"
                : item.tone === "success"
                ? "bg-[rgba(97,220,168,0.08)]"
                : item.tone === "warning"
                ? "bg-[rgba(253,224,71,0.08)]"
                : ""
            }`}
          >
            <span className="text-[var(--color-text-muted)]">{item.label}</span>
            <span
              className={`heading-4 ${
                item.tone === "highlight"
                  ? "text-[var(--color-accent)]"
                  : item.tone === "success"
                  ? "text-[var(--color-success)]"
                  : item.tone === "warning"
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--bg-paper)]"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
