"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/animations/CountUp";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-white/6 bg-white/[0.03] px-4 py-4 transition-all duration-300 ease-out hover:border-[var(--border-moss)] hover:shadow-sm";

export type MetricItem = {
  hint: string;
  label: string;
  tone?: "green" | "purple";
  value: string;
};

type MetricCardProps = {
  hint: string;
  icon?: ReactNode;
  label: string;
  tone?: "green" | "purple";
  value: number | string;
};

/**
 * Reusable metric card with animated count-up.
 * Used in Home dashboard and Feed insights sidebar.
 */
export function MetricCard({
  hint,
  icon,
  label,
  tone = "green",
  value,
}: Readonly<MetricCardProps>) {
  const numericValue = typeof value === "string" ? parseInt(value, 10) : value;
  const isNumeric = !isNaN(numericValue);

  return (
    <div
      className={cn(
        ITEM_CLASS,
        tone === "purple" && "border-[rgba(177,140,255,0.2)] bg-[rgba(177,140,255,0.06)] hover:border-[rgba(177,140,255,0.4)]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-[var(--font-mono)] text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {label}
          </p>
          <div className="flex items-baseline gap-1 mt-2">
            <p className="text-3xl font-extrabold tracking-tight text-[var(--ink-primary)]">
              {isNumeric ? <CountUp to={numericValue} /> : value}
            </p>
            <div className="h-1 w-1 rounded-full bg-[var(--moss)] opacity-40" />
          </div>
        </div>
        {icon ? (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm",
              tone === "purple"
                ? "border-[rgba(177,140,255,0.24)] bg-[rgba(36,28,53,0.96)] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]"
                : "border-[rgba(0,255,136,0.18)] bg-[rgba(47,56,26,0.92)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-[var(--ink-secondary)] opacity-80">{hint}</p>
    </div>
  );
}
