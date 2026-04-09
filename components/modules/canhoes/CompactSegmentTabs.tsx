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
                "canhoes-tap inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "border-[rgba(122,173,58,0.48)] bg-[rgba(36,49,23,0.98)] text-[var(--bg-paper)] shadow-[0_0_12px_rgba(0,255,136,0.08)]"
                  : "border-[rgba(212,184,150,0.14)] bg-[var(--bg-surface)] text-[rgba(245,237,224,0.85)] hover:bg-[rgba(28,36,18,0.92)] active:scale-95"
              )}
              aria-pressed={isActive}
            >
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-200",
                  isActive
                    ? "bg-[rgba(0,255,136,0.15)] text-[var(--neon-green)]"
                    : "border border-[rgba(122,173,58,0.3)] bg-[rgba(122,173,58,0.12)] text-[var(--color-moss-light)]"
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
