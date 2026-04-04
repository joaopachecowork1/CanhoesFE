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
                "canhoes-tap inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                isActive
                  ? "border-[rgba(122,173,58,0.48)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                  : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)]"
              )}
              aria-pressed={isActive}
            >
              <span className="truncate">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full border border-[rgba(122,173,58,0.34)] bg-[rgba(122,173,58,0.2)] px-1.5 py-0.5 text-[10px] text-[var(--bg-paper)]">
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
