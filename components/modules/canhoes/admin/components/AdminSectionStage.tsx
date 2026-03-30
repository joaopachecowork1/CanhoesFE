"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminSectionStageProps = {
  children: React.ReactNode;
  count?: number;
  description: string;
  kicker?: string;
  title: string;
  tone?: "default" | "purple";
};

export function AdminSectionStage({
  children,
  count = 0,
  description,
  kicker = "Pagina ativa",
  title,
  tone = "default",
}: Readonly<AdminSectionStageProps>) {
  return (
    <div className="space-y-4">
      <section
        className={cn(
          "rounded-[var(--radius-lg-token)] border px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5",
          tone === "purple"
            ? "border-[rgba(176,129,255,0.24)] bg-[linear-gradient(180deg,rgba(24,18,33,0.94),rgba(12,16,9,0.98))] [box-shadow:var(--shadow-panel),var(--glow-purple-sm)]"
            : "border-[var(--border-subtle)] bg-[linear-gradient(180deg,rgba(13,19,9,0.94),rgba(9,13,7,0.98))]"
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p
              className={cn(
                "editorial-kicker",
                tone === "purple"
                  ? "text-[var(--accent-purple-soft)]"
                  : "text-[var(--neon-green)]"
              )}
            >
              {kicker}
            </p>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[var(--bg-paper)]">
                {title}
              </h3>
              <p className="max-w-3xl text-sm leading-6 text-[rgba(245,237,224,0.72)]">
                {description}
              </p>
            </div>
          </div>

          {count > 0 ? (
            <Badge className="border-[var(--border-purple)] bg-[rgba(138,92,255,0.12)] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]">
              {count}
            </Badge>
          ) : null}
        </div>
      </section>

      {children}
    </div>
  );
}
