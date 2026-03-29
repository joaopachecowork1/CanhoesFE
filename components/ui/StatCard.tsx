import React from "react";

import { cn } from "@/lib/utils";
import { colors } from "@/lib/theme/tokens";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: string;
  className?: string;
  delay?: number;
  eyebrow?: string;
}

export function StatCard({
  icon,
  label,
  value,
  color = colors.moss,
  className,
  delay = 0,
  eyebrow = "Pulso",
}: Readonly<StatCardProps>) {
  return (
    <div
      className={cn(
        "canhoes-paper-card relative flex min-w-[148px] flex-col gap-3 overflow-hidden rounded-[var(--radius-md-token)] px-4 py-4 text-[var(--text-ink)]",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(0,255,136,0.22),rgba(255,184,0,0.18),transparent)]"
      />
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}35`,
            color,
          }}
        >
          {icon}
        </div>
        <span className="rounded-full border border-[rgba(107,76,42,0.12)] bg-[rgba(107,76,42,0.05)] px-2 py-1 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--bark)]/72">
          {eyebrow}
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-semibold leading-none text-[var(--text-ink)] [text-shadow:0_1px_0_rgba(255,255,255,0.24)]">
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--bark)]/72">
          {label}
        </div>
      </div>
    </div>
  );
}
