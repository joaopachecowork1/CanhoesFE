"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";
import { getAdminSectionMeta } from "../adminSections";

type AdminRouteTabItem = Pick<AdminSectionItem, "count" | "icon" | "id" | "label">;

type AdminRouteTabsProps = {
  activeId: AdminSectionId;
  items?: ReadonlyArray<AdminRouteTabItem>;
  onSelect?: (id: AdminSectionId) => void;
};

export function AdminRouteTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminRouteTabsProps>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sections = useMemo<ReadonlyArray<AdminRouteTabItem>>(
    () =>
      items ??
      getAdminSectionMeta().map((section) => ({
        ...section,
        count: 0,
      })),
    [items]
  );

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const activeElement = scroller.querySelector<HTMLElement>('[aria-current="page"]');
    activeElement?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.14),transparent_36%),linear-gradient(180deg,rgba(16,20,11,0.94),rgba(10,13,8,0.96))] px-2 py-1.5 shadow-[var(--shadow-panel)] backdrop-blur-sm">
      <div
        ref={scrollRef}
        className="-mx-1 overflow-x-auto px-1 scrollbar-none snap-x snap-mandatory"
      >
        <div className="flex min-w-max gap-1.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeId;

            return (
              <Link
                key={section.id}
                href={`/canhoes/admin/${section.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect?.(section.id)}
                className={cn(
                  "canhoes-tap inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition-[background-color,border-color,color,box-shadow]",
                  "snap-start",
                  isActive
                    ? "border-[rgba(122,173,58,0.48)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]"
                    : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)] hover:bg-[rgba(28,36,18,0.92)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-[var(--font-mono)] text-[9px] uppercase tracking-[0.11em]">
                  {section.label}
                </span>
                {section.count > 0 ? (
                  <Badge className="h-4 min-w-4 rounded-full border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.16)] px-1 text-[9px] font-semibold leading-none text-[var(--bg-paper)] shadow-none">
                    {section.count}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
