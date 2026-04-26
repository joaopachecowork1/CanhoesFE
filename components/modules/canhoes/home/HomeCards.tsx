"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-4 py-4 transition-all duration-300 ease-out hover:border-[var(--border-moss)] hover:shadow-sm";

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
      <p className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
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

export function ChecklistItem({
  done,
  hint,
  label,
}: Readonly<{ done: boolean; hint?: string; label: string }>) {
  return (
    <div className={cn(ITEM_CLASS, "flex items-start gap-4 text-[var(--ink-primary)] group")}>
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          done
            ? "border-[rgba(74,92,47,0.2)] bg-[rgba(74,92,47,0.06)] text-[var(--success)] shadow-[0_0_12px_rgba(74,92,47,0.1)]"
            : "border-[var(--border-paper)] bg-[rgba(212,184,150,0.1)] text-[var(--ink-muted)] group-hover:border-[var(--border-moss)]"
        )}
      >
        <CheckCircle2 className={cn("h-4.5 w-4.5 transition-transform duration-300", done && "scale-110")} />
      </span>
      <div className="min-w-0 flex-1">
        <span className={cn(
          "block text-[13px] font-bold leading-tight transition-colors duration-300",
          done ? "text-[var(--ink-primary)]" : "text-[var(--ink-secondary)] group-hover:text-[var(--ink-primary)]"
        )}>{label}</span>
        {hint ? (
          <span className="mt-1 block text-[11px] font-medium leading-normal text-[var(--ink-muted)] opacity-90">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
