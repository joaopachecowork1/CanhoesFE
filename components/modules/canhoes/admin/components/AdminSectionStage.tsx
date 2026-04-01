import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Tone = "default" | "destructive" | "neutral" | "primary";

type Props = {
  title: string;
  description?: string;
  count?: number;
  tone?: Tone;
  children?: React.ReactNode;
};

/**
 * AdminSectionStage – header + content wrapper for each admin section.
 *
 * Sits on the paper surface (canhoes-paper-card) so that the kicker, title,
 * and description are always legible. The `tone` prop shifts the accent from
 * moss-green (default) to purple for sections with special urgency (e.g. the
 * moderation queue).
 */
export function AdminSectionStage({
  title,
  description,
  count,
  tone = "default",
  children,
}: Readonly<Props>) {
  const toneStyles: Record<Tone, { badge: string; label: string }> = {
    default: {
      badge:
        "border-[rgba(122,173,58,0.3)] bg-[rgba(122,173,58,0.14)] text-[var(--moss)]",
      label: "text-[var(--moss)]",
    },
    destructive: {
      badge:
        "border-[rgba(220,38,38,0.24)] bg-[rgba(220,38,38,0.12)] text-[var(--text-error)]",
      label: "text-[var(--text-error)]",
    },
    neutral: {
      badge:
        "border-[rgba(107,76,42,0.18)] bg-[rgba(107,76,42,0.08)] text-[var(--bark)]",
      label: "text-[var(--bark)]",
    },
    primary: {
      badge:
        "border-[rgba(177,140,255,0.28)] bg-[rgba(177,140,255,0.12)] text-[var(--accent-purple-deep)]",
      label: "text-[var(--accent-purple-deep)]",
    },
  };

  return (
    <div className="space-y-4">
      <section className="canhoes-paper-card rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p
              className={cn(
                "font-[var(--font-mono)] text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
                toneStyles[tone].label
              )}
            >
              Secao ativa
            </p>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[var(--text-ink)]">
                {title}
              </h3>
              {description ? (
                <p className="max-w-3xl text-sm leading-6 text-[var(--bark)]/80">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          {typeof count === "number" && count > 0 ? (
            <Badge className={cn("shadow-none", toneStyles[tone].badge)}>
              {count}
            </Badge>
          ) : null}
        </div>
      </section>

      {children}
    </div>
  );
}
