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
      "h-16 w-16 rounded-[1.35rem] border border-[rgba(212,184,150,0.18)] bg-[radial-gradient(circle_at_30%_25%,rgba(122,173,58,0.22),transparent_45%),linear-gradient(180deg,rgba(39,48,24,0.96),rgba(18,23,11,0.98))] text-[var(--bg-paper)] shadow-[0_14px_24px_rgba(12,15,8,0.22)]",
      "hover:bg-[radial-gradient(circle_at_30%_25%,rgba(122,173,58,0.28),transparent_45%),linear-gradient(180deg,rgba(44,55,28,0.98),rgba(20,26,12,0.98))]",
      isComposeOpen &&
        "border-[rgba(0,255,136,0.28)] bg-[radial-gradient(circle_at_30%_25%,rgba(0,255,136,0.26),transparent_45%),linear-gradient(180deg,rgba(45,68,29,0.96),rgba(21,33,16,0.96))] shadow-[var(--glow-green-sm),0_14px_24px_rgba(12,15,8,0.22)]"
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
      className="fixed inset-x-0 bottom-0 z-40"
      aria-label="Navegacao principal do evento"
    >
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-3 pb-safe">
        <Dock
          items={items}
          className="h-auto p-0"
          containerClassName="h-auto w-full max-w-none justify-center"
          dockClassName={cn(
            "min-h-[5.35rem] w-fit max-w-full items-center gap-1.5 rounded-[2rem] border px-2 py-2",
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
      "h-16 w-16 rounded-[1.35rem] border border-transparent bg-transparent text-[rgba(245,237,224,0.76)] shadow-none",
      "hover:bg-[rgba(245,237,224,0.06)]",
      isMoreItem &&
        "border-[rgba(177,140,255,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.14),transparent_42%),linear-gradient(180deg,rgba(28,24,36,0.9),rgba(18,15,24,0.94))] text-[var(--accent-purple-soft)]",
      isActive &&
        "border-[rgba(177,140,255,0.28)] bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.1),transparent_55%),linear-gradient(180deg,rgba(42,55,28,0.94),rgba(20,27,13,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm),0_12px_24px_rgba(0,0,0,0.18)]"
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
