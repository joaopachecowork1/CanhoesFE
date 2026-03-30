"use client";

import { cn } from "@/lib/utils";

type AdminSectionSummaryItem = {
  label: string;
  tone?: "default" | "highlight" | "muted";
  value: number | string;
};

type AdminSectionSummaryProps = {
  description: string;
  items: ReadonlyArray<AdminSectionSummaryItem>;
  kicker: string;
  title: string;
};

export function AdminSectionSummary({
  description,
  items,
  kicker,
  title,
}: Readonly<AdminSectionSummaryProps>) {
  return (
    <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="editorial-kicker text-[var(--bark)]">{kicker}</p>
          <h3 className="text-lg font-semibold text-[var(--text-ink)]">{title}</h3>
          <p className="text-sm leading-6 text-[var(--bark)]/76">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-[var(--radius-md-token)] border px-3 py-3",
                item.tone === "highlight"
                  ? "border-[var(--border-purple)] bg-[rgba(138,92,255,0.12)] shadow-[var(--glow-purple-sm)]"
                  : item.tone === "muted"
                    ? "border-[rgba(107,76,42,0.12)] bg-[rgba(242,232,210,0.72)]"
                    : "border-[rgba(122,173,58,0.18)] bg-[rgba(249,242,231,0.84)]"
              )}
            >
              <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--bark)]/62">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--text-ink)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
