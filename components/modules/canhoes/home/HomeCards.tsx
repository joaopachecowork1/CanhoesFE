"use client";

import { cn } from "@/lib/utils";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-4 py-4 transition-all duration-300 ease-out hover:border-[var(--border-moss)] hover:shadow-sm";

export type MetricItem = {
  hint: string;
  label: string;
  tone?: "green" | "purple";
  value: string;
};



export function MetricCard({
  hint,
  label,
  tone = "green",
  value,
}: Readonly<{
  hint: string;
  label: string;
  tone?: "green" | "purple";
  value: string;
}>) {
  return (
    <div
      className={cn(
        ITEM_CLASS,
        tone === "purple" && "border-[rgba(177,140,255,0.2)] bg-[rgba(177,140,255,0.06)] hover:border-[rgba(177,140,255,0.4)]"
      )}
    >
      <p className="font-[var(--font-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
        {label}
      </p>
      <div className="flex items-baseline gap-1 mt-2">
        <p className="text-3xl font-extrabold tracking-tight text-[var(--ink-primary)]">{value}</p>
        <div className="h-1 w-1 rounded-full bg-[var(--moss)] opacity-40" />
      </div>
      <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--ink-secondary)] opacity-80">{hint}</p>
    </div>
  );
}

