"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { Dock, type DockItem } from "@/components/ui/dock-two";

import type { CanhoesNavItem } from "./canhoesNavigation";

export type CanhoesBottomTabEntry = {
  item: CanhoesNavItem;
  isActive?: boolean;
  onClick: () => void;
};

type CanhoesBottomTabsProps = {
  isComposeOpen: boolean;
  leftItems: readonly CanhoesBottomTabEntry[];
  onCompose: () => void;
  rightItems: readonly CanhoesBottomTabEntry[];
  showCompose?: boolean;
};

export function CanhoesBottomTabs({
  isComposeOpen,
  leftItems,
  onCompose,
  rightItems,
  showCompose = true,
}: Readonly<CanhoesBottomTabsProps>) {
  const composeItem = {
    ariaLabel: "Criar post",
    buttonClassName: cn(
      "min-h-[3.5rem] min-w-[4.25rem] rounded-xl border border-[rgba(212,184,150,0.15)] bg-[var(--bg-deep)] px-2 py-2 text-[var(--bg-paper)] shadow-sm",
      "hover:border-[rgba(122,173,58,0.3)]",
      isComposeOpen &&
        "border-[rgba(0,255,136,0.25)] bg-[rgba(45,68,29,0.96)] text-[var(--neon-green)]"
    ),
    icon: Plus,
    iconClassName: cn("h-5 w-5", isComposeOpen && "text-[var(--neon-green)]"),
    isActive: isComposeOpen,
    label: "Post",
    onClick: onCompose,
    tooltipClassName:
      "bg-[rgba(15,18,9,0.96)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
  } as const satisfies DockItem;

  const items = [
    ...leftItems.map((entry) => toDockItem(entry)),
    ...(showCompose ? [composeItem] : []),
    ...rightItems.map((entry) => toDockItem(entry)),
  ] as const satisfies readonly DockItem[];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50"
      aria-label="Navegacao principal do evento"
    >
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-2 pb-safe sm:px-3">
        <Dock
          items={items}
          className="h-auto p-0"
          containerClassName="h-auto w-full max-w-none justify-center"
          dockClassName={cn(
            "min-h-[4rem] w-max min-w-fit max-w-full items-center gap-1 rounded-[1.4rem] border px-1 py-1.5",
            "border-[rgba(122,173,58,0.22)] bg-[rgba(14,24,10,0.98)]",
            "shadow-[0_16px_32px_rgba(0,0,0,0.34)]"
          )}
        />
      </div>
    </nav>
  );
}

function toDockItem(entry: CanhoesBottomTabEntry): DockItem {
  const Icon: LucideIcon = entry.item.icon;
  const isActive = Boolean(entry.isActive);
  const isMoreItem = entry.item.id === "more";
  let iconToneClass = "text-[rgba(245,237,224,0.85)]";
  if (isMoreItem) {
    iconToneClass = "text-[var(--bg-paper)]";
  }
  if (isActive) {
    iconToneClass = "text-[var(--neon-green)]";
  }

  return {
    ariaLabel: entry.item.label,
    buttonClassName: cn(
      "min-h-[3.5rem] min-w-[4.25rem] rounded-xl border border-transparent bg-transparent px-2 py-1.5 text-[rgba(245,237,224,0.88)] transition-all duration-200",
      "hover:bg-[rgba(245,237,224,0.08)] active:scale-95",
      isMoreItem &&
        "border-[rgba(212,184,150,0.15)] bg-[var(--bg-surface)] text-[var(--bg-paper)]",
      isActive &&
        "border-[rgba(122,173,58,0.35)] bg-[rgba(42,55,28,0.96)] text-[var(--bg-paper)]"
    ),
    icon: Icon,
    iconClassName: cn(
      "h-[18px] w-[18px]",
      iconToneClass
    ),
    isActive,
    label: entry.item.label,
    onClick: entry.onClick,
    tooltipClassName:
      "bg-[rgba(15,18,9,0.96)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
  };
}
