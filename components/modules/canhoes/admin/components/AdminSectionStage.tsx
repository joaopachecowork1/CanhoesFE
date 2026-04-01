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
  const toneStyles = {
    default: "text-[var(--text-ink)]",
    destructive: "text-[var(--text-error)]",
    neutral: "text-[var(--beige)]",
    primary: "text-[var(--text-ink)]",
  };

  return (
    <div className="space-y-4">
      <section className="canhoes-paper-card rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p
              className={cn(
                "font-[var(--font-mono)] text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
                tone === "purple"
                  ? "text-[var(--accent-purple-deep)]"
                  : "text-[var(--moss)]"
              )}
            >
              {kicker}
            </p>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[var(--text-ink)]">
                {title}
              </h3>
              <p className="max-w-3xl text-sm leading-6 text-[var(--bark)]/80">
                {description}
              </p>
            </div>
          </div>

          {count > 0 ? (
            <Badge className="border-[rgba(122,173,58,0.3)] bg-[rgba(122,173,58,0.14)] text-[var(--moss)] shadow-none">
              {count}
            </Badge>
          ) : null}
        </div>
      </section>

      {children}
    </div>
  );
}
