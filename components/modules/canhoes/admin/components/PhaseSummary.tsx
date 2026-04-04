/**
 * Phase summary card for displaying phase statistics.
 * Matches the dark paper theme with moose-inspired border colors.
 * Used for proposal counts by phase, status breakdown, and other admin metrics.
 *
 * @param kicker - Short label above the title (editorial kicker style)
 * @param title - Main title for the summary section
 * @param description - Brief description of the summary section
 * @param stats - Array of stat items with label, value, tone, and optional icon
 * @example
 * ```tsx
 * <PhaseSummary
 *   kicker="Distribuição por fase"
 *   title="Propostas por fase de edicao"
 *   description="Veja como as propostas se distribuem nas diferentes fases."
 *   stats={[
 *     { label: "Candidatura", value: 45, tone: "default", icon: <IconCandidatura /> },
 *     { label: "Gala", value: 32, tone: "highlight", icon: <IconGala /> },
 *   ]}
 * />
 * ```
 */
export function PhaseSummary({
  description,
  kicker,
  stats,
  title,
}: Readonly<{
  description: string;
  kicker: string;
  stats: ReadonlyArray<{
    icon?: React.ReactNode;
    label: string;
    value: number | string;
    tone?: "default" | "highlight" | "muted" | "success" | "warning";
  }>;
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
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-[rgba(212,184,150,0.12)] px-3 py-2 ${
              stat.tone === "highlight"
                ? "bg-gradient-to-r from-[rgba(177,140,255,0.08)] to-transparent"
                : stat.tone === "success"
                ? "bg-[rgba(97,220,168,0.08)]"
                : stat.tone === "warning"
                ? "bg-[rgba(253,224,71,0.08)]"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              {stat.icon && <div className="shrink-0">{stat.icon}</div>}
              <span className="text-[var(--color-text-muted)]">{stat.label}</span>
            </div>
            <span
              className={`heading-4 ${
                stat.tone === "highlight"
                  ? "text-[var(--color-accent)]"
                  : stat.tone === "success"
                  ? "text-[var(--color-success)]"
                  : stat.tone === "warning"
                  ? "text-[var(--color-warning)]"
                  : "text-[var(--bg-paper)]"
              }`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
