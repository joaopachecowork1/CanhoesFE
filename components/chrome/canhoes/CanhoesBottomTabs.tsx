"use client";

import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { BOTTOM_NAV_ITEMS, isTabActive } from "./canhoesNavigation";

type CanhoesBottomTabsProps = {
  isComposeOpen: boolean;
  onCompose: () => void;
  onNavigate: (href: string) => void;
  pathname: string;
};

export function CanhoesBottomTabs({
  isComposeOpen,
  onCompose,
  onNavigate,
  pathname,
}: Readonly<CanhoesBottomTabsProps>) {
  const [feedTab, rankingTab, votingTab] = BOTTOM_NAV_ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-void)] backdrop-blur-xl">
      <div className="mx-auto max-w-[calc(var(--page-max-width)+10rem)] px-3 pb-safe">
        <div className="grid min-h-[5.35rem] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-1.5 py-2">
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
          <ComposeButton isOpen={isComposeOpen} onClick={onCompose} />
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
        "canhoes-tap flex min-h-12 flex-col items-center justify-center gap-1 rounded-[1rem] px-2 py-2 text-center transition-[background-color,color,opacity]",
        isActive
          ? "bg-[var(--accent)] text-[var(--text-primary)]"
          : "text-[rgba(232,223,200,0.64)] hover:text-[var(--text-primary)]"
      )}
      aria-current={isActive ? "page" : undefined}
      data-href={href}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-[background-color,color,border-color,box-shadow]",
          isActive
            ? "border-[var(--border-neon)]/60 bg-[var(--accent)] text-[var(--neon-green)] [text-shadow:var(--glow-green-sm)]"
            : "bg-transparent text-[var(--beige)]/76"
        )}
      >
        <Icon className="h-[1.15rem] w-[1.15rem]" />
      </span>
      <span
        className={cn(
          "font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]",
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
      className="canhoes-tap mx-auto flex min-h-12 flex-col items-center justify-end gap-1 px-2 pb-1.5 pt-0"
      aria-current={isOpen ? "page" : undefined}
      aria-label="Criar post"
      title="Criar post"
    >
      <span
        className={cn(
          "flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full border text-[var(--text-primary)] shadow-[var(--glow-moss)] transition-[transform,background-color,border-color,color,box-shadow]",
          isOpen
            ? "border-[var(--border-neon)] bg-[var(--accent)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[var(--border-moss)] bg-[var(--moss)] hover:border-[var(--border-neon)] hover:bg-[var(--moss-light)] hover:[box-shadow:var(--glow-green-sm)]"
        )}
      >
        <Plus className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span
        className={cn(
          "font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em]",
          isOpen
            ? "font-semibold text-[var(--neon-green)]"
            : "font-semibold text-[var(--text-primary)]"
        )}
      >
        Post
      </span>
    </button>
  );
}
