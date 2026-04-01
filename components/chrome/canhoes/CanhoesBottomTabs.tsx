"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CanhoesNavItem } from "./canhoesNavigation";

export type CanhoesBottomTabEntry = {
  item: CanhoesNavItem;
  isActive?: boolean;
  onClick: () => void;
};

type CanhoesBottomTabsProps = {
  isComposeOpen: boolean;
  leftItems: readonly [CanhoesBottomTabEntry, CanhoesBottomTabEntry];
  onCompose: () => void;
  rightItems: readonly [CanhoesBottomTabEntry, CanhoesBottomTabEntry];
};

export function CanhoesBottomTabs({
  isComposeOpen,
  leftItems,
  onCompose,
  rightItems,
}: Readonly<CanhoesBottomTabsProps>) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-3 pb-safe">
        <div className="canhoes-bottom-dock mt-2 grid min-h-[6.1rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)] items-end gap-2 px-2.5 py-3">
          <BottomTab entry={leftItems[0]} />
          <BottomTab entry={leftItems[1]} />
          <ComposeButton isOpen={isComposeOpen} onClick={onCompose} />
          <BottomTab entry={rightItems[0]} />
          <BottomTab entry={rightItems[1]} />
        </div>
      </div>
    </nav>
  );
}

function BottomTab({
  entry,
}: Readonly<{
  entry: CanhoesBottomTabEntry;
}>) {
  const Icon = entry.item.icon as LucideIcon;
  const isActive = Boolean(entry.isActive);
  const isMoreItem = entry.item.id === "more";

  return (
    <button
      type="button"
      onClick={entry.onClick}
      className={cn(
        "canhoes-tap canhoes-bottom-tab flex min-h-[4.1rem] flex-col items-center justify-center gap-1.5 rounded-[1.45rem] px-2 py-2 text-center transition-[transform,background-color,color,border-color,box-shadow]",
        isActive && "is-active"
      )}
      aria-current={isActive ? "page" : undefined}
      data-href={entry.item.href}
      data-more={isMoreItem ? "true" : "false"}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border transition-[transform,background-color,color,border-color,box-shadow]",
          isActive
            ? "border-[rgba(177,140,255,0.34)] bg-[linear-gradient(180deg,rgba(47,63,27,0.96),rgba(25,31,18,0.98))] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm),var(--glow-purple)]"
            : isMoreItem
              ? "border-[rgba(177,140,255,0.3)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.24),transparent_42%),linear-gradient(180deg,rgba(45,34,62,0.96),rgba(25,20,38,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]"
              : "border-transparent bg-transparent text-[rgba(245,237,224,0.76)]"
        )}
      >
        <Icon className="h-[1.08rem] w-[1.08rem]" />
      </span>

      <span
        className={cn(
          "font-[var(--font-mono)] text-[10px] uppercase tracking-[0.18em]",
          isActive
            ? "font-semibold text-[var(--bg-paper)]"
            : isMoreItem
              ? "font-semibold text-[var(--accent-purple-soft)]"
              : "font-medium text-[rgba(245,237,224,0.72)]"
        )}
      >
        {entry.item.label}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "h-0.5 w-7 rounded-full transition-opacity",
          isActive
            ? "bg-[linear-gradient(90deg,var(--neon-green),var(--accent-purple))] opacity-100 [box-shadow:var(--glow-green-sm),var(--glow-purple-sm)]"
            : "opacity-0"
        )}
      />
    </button>
  );
}

function ComposeButton({
  isOpen,
  onClick,
}: Readonly<{
  isOpen: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canhoes-tap mx-auto flex min-h-12 flex-col items-center justify-end gap-1 px-2 pb-1 pt-0"
      aria-current={isOpen ? "page" : undefined}
      aria-label="Criar post"
      title="Criar post"
    >
      <span
        className={cn(
          "canhoes-bottom-fab flex h-16 w-16 -translate-y-5 items-center justify-center rounded-full border text-[var(--bg-paper)] transition-[transform,background-color,border-color,color,box-shadow]",
          isOpen && "is-open [box-shadow:var(--glow-green-sm),var(--glow-purple)]"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2.6} />
      </span>
      <span
        className={cn(
          "font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em]",
          isOpen ? "font-semibold text-[var(--neon-green)]" : "font-semibold text-[var(--bg-paper)]"
        )}
      >
        Post
      </span>
    </button>
  );
}
