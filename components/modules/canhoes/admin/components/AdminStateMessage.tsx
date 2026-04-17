import { cn } from "@/lib/utils";

/**
 * State message component for displaying loading, empty, or disabled states.
 * Uses paper surfaces so the admin reads consistently against dark chrome.
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
  action,
  children,
  variant = "panel",
  tone = "default",
}: Readonly<{
  action?: React.ReactNode;
  children: React.ReactNode;
  variant?: "page" | "panel" | "card";
  tone?: "default" | "warning" | "error";
}>) {
  const styles = {
    page:
      "flex min-h-[50vh] items-center justify-center rounded-[var(--radius-lg-token)] border border-[rgba(84,64,40,0.16)] bg-[var(--bg-paper)] px-5 py-8 text-center text-[var(--ink-primary)] shadow-[var(--shadow-paper)]",
    panel:
      "flex items-center justify-center rounded-[var(--radius-md-token)] border border-dashed border-[rgba(84,64,40,0.16)] bg-[var(--bg-paper-soft)] px-4 py-8 text-center body-small text-[var(--ink-primary)] shadow-[var(--shadow-paper)]",
    card: "flex items-center justify-center text-center text-[var(--ink-primary)]",
  }[variant];

  const toneClass =
    tone === "error"
      ? "border-[rgba(224,90,58,0.24)] bg-[rgba(255,244,240,0.96)] text-[var(--ink-primary)]"
      : tone === "warning"
      ? "border-[rgba(253,224,71,0.22)] bg-[var(--bg-paper-soft)] text-[var(--ink-primary)]"
      : "border-[rgba(212,184,150,0.22)] bg-[var(--bg-paper)] text-[var(--ink-primary)]";

  return (
    <div className={cn(styles, toneClass)}>
      <div className="flex flex-col items-center justify-center gap-3">
        {children}
        {action}
      </div>
    </div>
  );
}
