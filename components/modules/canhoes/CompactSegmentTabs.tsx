"use client";

import { cn } from "@/lib/utils";

type CompactSegmentItem = {
  badge?: string;
  id: string;
  label: string;
};

type CompactSegmentTabsProps = {
  activeId: string;
  items: ReadonlyArray<CompactSegmentItem>;
  onSelect: (id: string) => void;
};

export function CompactSegmentTabs({
  activeId,
  items,
  onSelect,
}: Readonly<CompactSegmentTabsProps>) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
      <div className="flex min-w-max gap-2">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "canhoes-tap inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 py-2 text-[13px] font-bold tracking-tight transition-all duration-300 ease-out active:scale-[0.96]",
                isActive
                  ? "border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]"
                  : "border-[rgba(212,184,150,0.12)] bg-[rgba(14,19,10,0.85)] text-[rgba(243,234,216,0.7)] hover:border-[rgba(212,184,150,0.24)] hover:bg-[rgba(20,26,13,0.92)] hover:text-[rgba(243,234,216,0.9)]"
              )}
              aria-pressed={isActive}
            >
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold transition-all duration-300",
                  isActive
                    ? "bg-[var(--moss)] text-white"
                    : "border border-[rgba(95,123,56,0.24)] bg-[rgba(95,123,56,0.12)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                )}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
