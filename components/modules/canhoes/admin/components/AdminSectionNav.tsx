"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";

type AdminSectionNavProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
  onSelect: (id: AdminSectionId) => void;
};

/**
 * AdminSectionNav – sticky tab strip for switching between admin sections.
 *
 * Designed mobile-first: horizontally scrollable pill tabs that sit on the
 * same paper surface as the rest of the admin module. Keeps all primary
 * sections always reachable with one tap. Secondary sections collapse into
 * the same row rather than a separate dropdown to reduce interaction depth.
 */
export function AdminSectionNav({
  activeId,
  items,
  onSelect,
}: Readonly<AdminSectionNavProps>) {
  const primaryItems = useMemo(
    () => items.filter((item) => item.group === "primary"),
    [items]
  );
  const secondaryItems = useMemo(
    () => items.filter((item) => item.group === "secondary"),
    [items]
  );

  return (
    <div className="canhoes-paper-card overflow-hidden rounded-[var(--radius-lg-token)] px-3 py-3 shadow-[var(--shadow-paper-soft)]">
      {/* Scrollable primary tabs */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
        <div className="flex min-w-max gap-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isActive}
                className={cn(
                  "canhoes-tap inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-150",
                  isActive
                    ? "border-[rgba(74,92,47,0.4)] bg-[var(--moss)] text-[var(--bg-paper)] shadow-[var(--glow-moss)]"
                    : "border-[rgba(107,76,42,0.18)] bg-[rgba(255,255,255,0.4)] text-[var(--text-ink)] hover:bg-[rgba(255,255,255,0.65)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.count > 0 ? (
                  <Badge
                    className={cn(
                      "rounded-full px-1.5 text-[0.7rem]",
                      isActive
                        ? "border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.22)] text-[var(--bg-paper)]"
                        : "border-[rgba(122,173,58,0.3)] bg-[rgba(122,173,58,0.14)] text-[var(--moss)]"
                    )}
                  >
                    {item.count}
                  </Badge>
                ) : null}
              </button>
            );
          })}

          {/* Secondary sections inline (avoids an extra dropdown interaction on mobile) */}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={isActive}
                className={cn(
                  "canhoes-tap inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-150",
                  isActive
                    ? "border-[rgba(74,92,47,0.4)] bg-[var(--moss)] text-[var(--bg-paper)] shadow-[var(--glow-moss)]"
                    : "border-[rgba(107,76,42,0.14)] bg-[rgba(255,255,255,0.28)] text-[var(--bark)] hover:bg-[rgba(255,255,255,0.48)]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.count > 0 ? (
                  <Badge className="rounded-full border-[rgba(122,173,58,0.3)] bg-[rgba(122,173,58,0.14)] px-1.5 text-[0.7rem] text-[var(--moss)]">
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
