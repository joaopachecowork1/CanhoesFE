/**
 * State message component for displaying loading, empty, or disabled states.
 * Matches the dark paper theme with moose-inspired styling.
 *
 * @param variant - Type of message: 'page' (full page), 'panel' (in panel), 'card' (in card)
 * @param tone - Visual tone: 'default', 'warning', 'error'
 * @param children - Message text to display
 * @example
 * ```tsx
 * <AdminStateMessage variant="page">Carregando propostas...</AdminStateMessage>
 * <AdminStateMessage variant="panel" tone="warning">Nenhuma proposta encontrada.</AdminStateMessage>
 * ```
 */
export function AdminStateMessage({
  children,
  variant = "panel",
  tone = "default",
}: Readonly<{
  children: React.ReactNode;
  variant?: "page" | "panel" | "card";
  tone?: "default" | "warning" | "error";
}>) {
  const styles = {
    page:
      "flex min-h-[50vh] items-center justify-center text-center text-[var(--color-text-muted)]",
    panel:
      "rounded-[var(--radius-md-token)] border border-dashed px-4 py-8 text-center body-small flex items-center justify-center",
    card:
      "text-center text-[var(--color-text-muted)] flex items-center justify-center",
  }[variant];

  const toneClass =
    tone === "error"
      ? "border-[rgba(224,90,58,0.24)] bg-[rgba(30,18,12,0.9)] text-[rgba(255,236,231,0.92)]"
      : tone === "warning"
      ? "border-[rgba(253,224,71,0.22)] bg-[rgba(30,18,12,0.9)] text-[rgba(245,237,224,0.72)]"
      : "border-[rgba(212,184,150,0.22)] bg-[rgba(18,23,12,0.72)] text-[rgba(245,237,224,0.72)]";

  return <div className={cn(styles, toneClass)}>{children}</div>;
}
