"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();
  const sections = items ?? getAdminSectionMeta().map((section) => ({ ...section, count: 0 }));

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const activeElement = scroller.querySelector<HTMLElement>('[aria-current="page"]');
    activeElement?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId, prefersReducedMotion]);

  return (
    <div className="canhoes-bits-panel canhoes-bits-panel--admin canhoes-admin-shell-panel overflow-hidden rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-2 py-1.5 shadow-[var(--shadow-paper)]">

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
                  "canhoes-tap inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold transition-[background-color,border-color,color,box-shadow]",
                  "snap-start",
                  isActive
                    ? "border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]"
                    : "border-[var(--border-paper)] bg-[var(--bg-paper-soft)] text-[var(--ink-secondary)] hover:bg-[var(--bg-paper)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-[var(--font-mono)] text-[9px] uppercase tracking-[0.11em]">
                  {section.label}
                </span>
                {section.count > 0 ? (
                  <Badge className="h-4 min-w-4 rounded-full border-[var(--border-paper)] bg-[rgba(122,173,58,0.1)] px-1 text-[9px] font-semibold leading-none text-[var(--ink-primary)] shadow-none">
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
