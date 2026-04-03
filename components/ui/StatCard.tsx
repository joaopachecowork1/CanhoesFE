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
        "relative flex min-w-[148px] flex-col gap-3 overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.72)] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
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
        <span className="rounded-full border border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.72)] px-2 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(245,237,224,0.72)]">
          {eyebrow}
        </span>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-semibold leading-none text-[var(--bg-paper)]">
          {value}
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(245,237,224,0.72)]">
          {label}
        </div>
      </div>
    </div>
  );
}
