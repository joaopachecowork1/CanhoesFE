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

function getSummaryToneClass(tone: AdminSectionSummaryItem["tone"]) {
  if (tone === "highlight") {
    return "border-[var(--border-purple)] bg-[rgba(93,67,138,0.38)] shadow-[var(--glow-purple-sm)]";
  }
  if (tone === "muted") {
    return "border-[rgba(212,184,150,0.14)] bg-[rgba(14,18,10,0.62)]";
  }
  return "border-[rgba(122,173,58,0.2)] bg-[rgba(31,44,18,0.54)]";
}

export function AdminSectionSummary({
  description,
  items,
  kicker,
  title,
}: Readonly<AdminSectionSummaryProps>) {
  return (
    <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.16),transparent_36%),linear-gradient(180deg,rgba(18,24,11,0.95),rgba(11,14,8,0.97))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="editorial-kicker text-[var(--neon-green)]">{kicker}</p>
          <h3 className="text-lg font-semibold text-[var(--bg-paper)]">{title}</h3>
          <p className="text-sm leading-6 text-[rgba(245,237,224,0.76)]">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-[var(--radius-md-token)] border px-3 py-3",
                getSummaryToneClass(item.tone)
              )}
            >
              <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.66)]">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--bg-paper)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
