"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { BOTTOM_NAV_ITEMS, isTabActive } from "./canhoesNavigation";

type CanhoesBottomTabsProps = {
  isMoreActive: boolean;
  onNavigate: (href: string) => void;
  onOpenMore: () => void;
  pathname: string;
};

export function CanhoesBottomTabs({
  isMoreActive,
  onNavigate,
  onOpenMore,
  pathname,
}: Readonly<CanhoesBottomTabsProps>) {
  const [feedTab, rankingTab, votingTab] = BOTTOM_NAV_ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-neon)]/25 bg-[rgba(15,18,9,0.94)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[rgba(15,18,9,0.86)]">
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-3 pb-safe">
        <div className="grid min-h-[4.75rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 py-2">
          <BottomTab
            href={feedTab.href}
            icon={feedTab.icon}
            isActive={isTabActive(pathname, feedTab.href)}
            label={feedTab.label}
            onClick={() => onNavigate(feedTab.href)}
          />
          <BottomTab
            href={rankingTab.href}
            icon={rankingTab.icon}
            isActive={isTabActive(pathname, rankingTab.href)}
            label={rankingTab.label}
            onClick={() => onNavigate(rankingTab.href)}
          />
          <MoreButton isActive={isMoreActive} onClick={onOpenMore} />
          <BottomTab
            href={votingTab.href}
            icon={votingTab.icon}
            isActive={isTabActive(pathname, votingTab.href)}
            label={votingTab.label}
            onClick={() => onNavigate(votingTab.href)}
          />
        </div>
      </div>
    </nav>
  );
}

function BottomTab({
  href,
  icon: Icon,
  isActive,
  label,
  onClick,
}: Readonly<{
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "canhoes-tap flex min-h-12 flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2 text-center transition-colors",
        isActive
          ? "bg-[rgba(0,255,136,0.08)] text-[var(--text-primary)]"
          : "text-[rgba(232,223,200,0.62)] hover:text-[var(--text-primary)]"
      )}
      aria-current={isActive ? "page" : undefined}
      data-href={href}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          isActive
            ? "bg-[rgba(0,255,136,0.12)] text-[var(--neon-green)] [text-shadow:var(--glow-green-sm)]"
            : "bg-transparent"
        )}
      >
        <Icon className="h-[1.15rem] w-[1.15rem]" />
      </span>
      <span
        className={cn(
          "font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.12em]",
          isActive ? "font-semibold text-[var(--text-primary)]" : "font-medium"
        )}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "h-0.5 w-7 rounded-full transition-opacity",
          isActive
            ? "bg-[var(--neon-green)] opacity-100 [box-shadow:var(--glow-green-sm)]"
            : "opacity-0"
        )}
      />
    </button>
  );
}

function MoreButton({
  isActive,
  onClick,
}: Readonly<{
  isActive: boolean;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canhoes-tap mx-auto flex min-h-12 flex-col items-center justify-center gap-1 px-2 py-1.5"
      aria-current={isActive ? "page" : undefined}
      aria-label="Abrir mais opções"
      title="Mais opções"
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border text-[var(--text-primary)] shadow-[var(--glow-moss)] transition-[transform,background-color,border-color,color,box-shadow]",
          isActive
            ? "border-[var(--border-neon)] bg-[rgba(0,255,136,0.14)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[var(--border-moss)] bg-[var(--moss)] hover:border-[var(--border-neon)] hover:text-[var(--neon-green)]"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span
        className={cn(
          "font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.12em]",
          isActive
            ? "font-semibold text-[var(--text-primary)]"
            : "font-medium text-[rgba(232,223,200,0.74)]"
        )}
      >
        Mais
      </span>
    </button>
  );
}
