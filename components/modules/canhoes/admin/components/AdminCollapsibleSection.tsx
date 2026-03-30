"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminCollapsibleSectionProps = {
  children: React.ReactNode;
  count?: number;
  defaultOpen?: boolean;
  kicker?: string;
  title: string;
};

export function AdminCollapsibleSection({
  children,
  count,
  defaultOpen = false,
  kicker,
  title,
}: Readonly<AdminCollapsibleSectionProps>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((currentState) => !currentState)}
        className="canhoes-tap flex w-full items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,11,0.62)] px-4 py-3 text-left transition-[border-color,background-color,box-shadow] hover:border-[var(--border-purple)] hover:[box-shadow:var(--glow-purple-sm)]"
      >
        <span className="min-w-0 space-y-1">
          {kicker ? <span className="editorial-kicker">{kicker}</span> : null}
          <span className="block heading-3 text-[var(--bg-paper)]">{title}</span>
        </span>

        <span className="flex items-center gap-2">
          {typeof count === "number" ? (
            <span className="rounded-full border border-[var(--border-paper)] bg-[rgba(245,237,224,0.1)] px-2.5 py-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-[var(--bg-paper)]">
              {count}
            </span>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[var(--accent-purple-soft)] transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open ? <div className="space-y-3">{children}</div> : null}
    </section>
  );
}
