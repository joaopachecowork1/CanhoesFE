"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3";

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
        tone === "purple" && "border-[rgba(212,184,150,0.24)] bg-[rgba(57,45,28,0.3)]"
      )}
    >
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.76)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-[var(--bg-paper)]">{value}</p>
      <p className="mt-1 text-xs text-[rgba(245,237,224,0.8)]">{hint}</p>
    </div>
  );
}

export function ChecklistItem({
  done,
  hint,
  label,
}: Readonly<{ done: boolean; hint?: string; label: string }>) {
  return (
    <div className={cn(ITEM_CLASS, "flex items-start gap-3 text-[var(--bg-paper)]")}>
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-[rgba(74,92,47,0.24)] bg-[rgba(74,92,47,0.12)] text-[var(--success)]"
            : "border-[rgba(212,184,150,0.28)] bg-[rgba(212,184,150,0.12)] text-[var(--beige)]"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--bg-paper)]">{label}</span>
        {hint ? (
          <span className="mt-1 block text-xs text-[rgba(245,237,224,0.8)]">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
