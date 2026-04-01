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
  const items = [
    ...leftItems.map((entry) => toDockItem(entry)),
    {
      ariaLabel: "Criar post",
      buttonClassName: cn(
        "h-16 w-16 flex-none -translate-y-5 rounded-full border border-[rgba(212,184,150,0.24)] bg-[radial-gradient(circle_at_30%_25%,rgba(122,173,58,0.28),transparent_45%),linear-gradient(180deg,#5b6f34_0%,#3c4b22_100%)] text-[var(--bg-paper)] shadow-[0_18px_28px_rgba(12,15,8,0.3),0_0_0_1px_rgba(255,255,255,0.04)]",
        "hover:bg-[radial-gradient(circle_at_30%_25%,rgba(122,173,58,0.34),transparent_45%),linear-gradient(180deg,#637a39_0%,#415127_100%)]",
        isComposeOpen &&
          "border-[rgba(0,255,136,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(0,255,136,0.32),transparent_45%),linear-gradient(180deg,rgba(55,83,35,0.96),rgba(24,38,18,0.96))] shadow-[var(--glow-green-sm),var(--glow-purple-sm)]"
      ),
      icon: Plus,
      iconClassName: cn("h-5 w-5", isComposeOpen && "text-[var(--neon-green)]"),
      isActive: isComposeOpen,
      label: "Post",
      onClick: onCompose,
      tooltipClassName:
        "bg-[rgba(15,18,9,0.96)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
    },
    ...rightItems.map((entry) => toDockItem(entry)),
  ] as const satisfies readonly DockItem[];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40"
      aria-label="Navegacao principal do evento"
    >
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-3 pb-safe">
        <Dock
          items={items}
          className="h-auto p-0"
          containerClassName="h-auto w-full max-w-none"
          dockClassName={cn(
            "min-h-[5.7rem] w-full items-end justify-between gap-1.5 rounded-[2rem] border px-2 py-2",
            "border-[rgba(212,184,150,0.14)] bg-[radial-gradient(circle_at_top_center,rgba(0,255,136,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(177,140,255,0.16),transparent_28%),linear-gradient(180deg,rgba(18,22,11,0.94),rgba(10,13,8,0.96))]",
            "shadow-[0_20px_46px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[18px]"
          )}
        />
      </div>
    </nav>
  );
}

function toDockItem(entry: CanhoesBottomTabEntry): DockItem {
  const Icon = entry.item.icon as LucideIcon;
  const isActive = Boolean(entry.isActive);
  const isMoreItem = entry.item.id === "more";

  return {
    ariaLabel: entry.item.label,
    buttonClassName: cn(
      "min-h-[4.35rem] min-w-0 flex-1 rounded-[1.45rem] border border-transparent px-3 py-3 text-[rgba(245,237,224,0.76)] transition-[transform,background-color,color,border-color,box-shadow]",
      "hover:bg-[rgba(245,237,224,0.06)]",
      isMoreItem &&
        "border-[rgba(177,140,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_42%),linear-gradient(180deg,rgba(45,34,62,0.92),rgba(25,20,38,0.96))] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]",
      isActive &&
        "border-[rgba(177,140,255,0.34)] bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.1),transparent_55%),linear-gradient(180deg,rgba(242,231,210,0.18),rgba(177,140,255,0.14))] text-[var(--bg-paper)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_20px_rgba(0,0,0,0.16),var(--glow-purple)] after:absolute after:bottom-1.5 after:left-1/2 after:h-0.5 after:w-7 after:-translate-x-1/2 after:rounded-full after:bg-[linear-gradient(90deg,var(--neon-green),var(--accent-purple))] after:shadow-[var(--glow-green-sm),var(--glow-purple-sm)] after:content-['']"
    ),
    icon: Icon,
    iconClassName: cn(
      "h-[1.08rem] w-[1.08rem]",
      isActive
        ? "text-[var(--neon-green)]"
        : isMoreItem
          ? "text-[var(--accent-purple-soft)]"
          : "text-[rgba(245,237,224,0.76)]"
    ),
    isActive,
    label: entry.item.label,
    onClick: entry.onClick,
    tooltipClassName:
      "bg-[rgba(15,18,9,0.96)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
  };
}
