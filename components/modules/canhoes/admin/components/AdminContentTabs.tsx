"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type {
  AdminContentSectionId,
  AdminContentSectionItem,
} from "../adminContentSections";

type AdminContentTabsProps = {
  activeId: AdminContentSectionId;
  items: ReadonlyArray<AdminContentSectionItem>;
  onSelect: (id: AdminContentSectionId) => void;
};

export function AdminContentTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminContentTabsProps>) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-2 py-2 shadow-[var(--shadow-paper)]">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none snap-x snap-mandatory">
        <div className="flex min-w-max gap-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isActive}
                className={cn(
                  "canhoes-tap inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color,box-shadow]",
                  "snap-start",
                  isActive
                    ? "border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]"
                    : "border-[var(--border-paper)] bg-[var(--bg-paper-soft)] text-[var(--ink-secondary)] hover:bg-[var(--bg-paper)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.11em]">
                  {item.label}
                </span>
                {item.count > 0 ? (
                  <Badge
                    className={cn(
                      "rounded-full px-1.5 text-[0.65rem] shadow-none",
                      isActive
                        ? "border-[var(--border-paper)] bg-[rgba(122,173,58,0.1)] text-[var(--ink-primary)]"
                        : "border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-secondary)]"
                    )}
                  >
                    {item.count}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
