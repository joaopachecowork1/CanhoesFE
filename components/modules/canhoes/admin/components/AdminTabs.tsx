"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";
import { Button } from "@/components/ui/button";

type AdminTabsProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
  onSelect: (id: AdminSectionId) => void;
};

export function AdminTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminTabsProps>) {
  return (
    <div className="canhoes-paper-card overflow-hidden rounded-[var(--radius-lg-token)] px-3 py-3 shadow-[var(--shadow-paper-soft)]">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
        <div className="flex min-w-max gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <Button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "canhoes-tap inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow]",
                  isActive
                    ? "border-[var(--border-purple)] bg-[linear-gradient(180deg,rgba(31,40,20,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]"
                    : "border-[rgba(107,76,42,0.16)] bg-[rgba(255,255,255,0.48)] text-[var(--text-ink)] hover:bg-[rgba(255,255,255,0.72)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.12em]">
                  {item.label}
                </span>
                {item.count > 0 ? (
                  <Badge
                    className={cn(
                      "rounded-full px-1.5 text-[0.7rem] shadow-none",
                      isActive
                        ? "border-[rgba(255,255,255,0.24)] bg-[rgba(255,255,255,0.16)] text-[var(--bg-paper)]"
                        : "border-[rgba(122,173,58,0.22)] bg-[rgba(122,173,58,0.12)] text-[var(--moss)]"
                    )}
                  >
                    {item.count}
                  </Badge>
                ) : null}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
