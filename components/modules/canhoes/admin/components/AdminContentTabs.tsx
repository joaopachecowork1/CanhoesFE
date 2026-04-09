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
    <div className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.14),transparent_36%),linear-gradient(180deg,rgba(16,20,11,0.94),rgba(10,13,8,0.96))] px-2 py-2 shadow-[var(--shadow-panel)] backdrop-blur-sm">
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
                    ? "border-[rgba(122,173,58,0.48)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                    : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)] hover:bg-[rgba(28,36,18,0.92)]"
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
                        ? "border-[rgba(122,173,58,0.32)] bg-[rgba(122,173,58,0.2)] text-[var(--bg-paper)]"
                        : "border-[rgba(212,184,150,0.16)] bg-[rgba(18,24,11,0.92)] text-[rgba(245,237,224,0.82)]"
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
