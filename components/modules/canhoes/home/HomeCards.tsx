"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-3 py-3";

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
        tone === "purple" && "border-[rgba(177,140,255,0.24)] bg-[rgba(177,140,255,0.08)]"
      )}
    >
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--ink-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--ink-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--ink-secondary)]">{hint}</p>
    </div>
  );
}

export function ChecklistItem({
  done,
  hint,
  label,
}: Readonly<{ done: boolean; hint?: string; label: string }>) {
  return (
    <div className={cn(ITEM_CLASS, "flex items-start gap-3 text-[var(--ink-primary)]")}>
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-[rgba(74,92,47,0.24)] bg-[rgba(74,92,47,0.08)] text-[var(--success)]"
            : "border-[var(--border-paper)] bg-[rgba(212,184,150,0.14)] text-[var(--ink-secondary)]"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--ink-primary)]">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs text-[var(--ink-secondary)]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
