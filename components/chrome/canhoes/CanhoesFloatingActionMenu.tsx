"use client";

import type { CSSProperties } from "react";
import { useEffect } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";

import type { EventOverviewDto } from "@/lib/api/types";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
  getVisibleMoreAdminItem,
  getVisibleMoreNavItems,
  type CanhoesNavItem,
} from "./canhoesNavigation";

type CanhoesFloatingActionMenuProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  isLocalMode: boolean;
  overview?: EventOverviewDto | null;
  primaryIds: readonly string[];
  onNavigate: (href: string) => void;
};

export function CanhoesFloatingActionMenu({
  isOpen,
  onOpenChange,
  isAdmin,
  isLocalMode,
  overview,
  primaryIds,
  onNavigate,
}: Readonly<CanhoesFloatingActionMenuProps>) {
  const pathname = usePathname();
  const shortcuts = getVisibleMoreNavItems({
    excludedIds: [...primaryIds],
    isAdmin,
    isLocalMode,
    overview,
  });

  const adminShortcut = getVisibleMoreAdminItem({
    excludedIds: [...primaryIds],
    isAdmin,
    isLocalMode,
    overview,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fechar menu"
        className="absolute inset-0 bg-[rgba(5,8,4,0.6)] backdrop-blur-[3px]"
        onClick={() => onOpenChange(false)}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-4 pb-[calc(6.25rem+env(safe-area-inset-bottom,0px))] pt-24 sm:px-6 sm:pb-6">
        <section className="pointer-events-auto w-full max-w-[24rem] overflow-hidden rounded-[2rem] border border-[rgba(177,140,255,0.22)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.2),transparent_30%),linear-gradient(180deg,rgba(21,30,13,0.98),rgba(8,12,6,0.98))] text-[var(--text-primary)] shadow-[var(--shadow-panel),var(--glow-purple-sm)]">
          <div className="flex items-start justify-between gap-4 border-b border-[rgba(212,184,150,0.12)] px-5 py-4">
            <div className="min-w-0 space-y-1">
              <p className="label text-[rgba(245,237,224,0.62)]">
                {adminCopy.shell.more.kicker}
              </p>
              <h2 className="text-base font-semibold text-[var(--bg-paper)]">
                {adminCopy.shell.more.title}
              </h2>
              <p className="body-small text-[rgba(245,237,224,0.74)]">
                {adminCopy.shell.more.description}
              </p>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 shrink-0 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.68)] text-[var(--bg-paper)] hover:bg-[rgba(38,48,24,0.92)]"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="rounded-[1.4rem] border border-[rgba(0,255,136,0.14)] bg-[linear-gradient(180deg,rgba(24,35,15,0.94),rgba(13,19,9,0.96))] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="label text-[rgba(245,237,224,0.56)]">
                    {adminCopy.shell.more.summaryLabel}
                  </p>
                  <p className="text-sm font-semibold text-[var(--bg-paper)]">
                    {adminCopy.shell.more.summaryTitle}
                  </p>
                </div>
                <span className="inline-flex min-h-9 items-center rounded-full border border-[rgba(177,140,255,0.26)] bg-[rgba(34,28,48,0.88)] px-3 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-purple-soft)]">
                  {shortcuts.length + (adminShortcut ? 1 : 0)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[rgba(245,237,224,0.72)]">
                {adminCopy.shell.more.summaryDescription}
              </p>
            </div>

            {shortcuts.length > 0 ? (
              <div className="space-y-2">
                {shortcuts.map((item, index) => (
                  <FloatingMenuLink
                    key={item.id}
                    item={item}
                    isActive={Boolean(pathname && pathname.startsWith(item.href))}
                    onClick={() => onNavigate(item.href)}
                    style={{ transitionDelay: `${index * 32}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div className="canhoes-paper-card rounded-[1.25rem] px-4 py-3 text-sm text-[var(--text-muted)]">
                {adminCopy.shell.more.empty}
              </div>
            )}

            {adminShortcut ? (
              <AdminShortcutCard
                isActive={Boolean(pathname && pathname.startsWith(adminShortcut.href))}
                item={adminShortcut}
                onClick={() => onNavigate(adminShortcut.href)}
              />
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function FloatingMenuLink({
  item,
  isActive,
  onClick,
  style,
}: Readonly<{
  item: CanhoesNavItem;
  isActive: boolean;
  onClick: () => void;
  style?: CSSProperties;
}>) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "canhoes-tap flex w-full items-center gap-3 rounded-full border px-4 py-3 text-left shadow-[var(--shadow-paper-soft)] transition-[transform,border-color,background-color,box-shadow] hover:[box-shadow:var(--shadow-paper-soft),var(--glow-purple-sm)] active:scale-[0.99]",
        isActive
          ? "border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(250,244,233,1),rgba(241,233,218,0.98))] text-[var(--text-dark)]"
          : "border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,rgba(251,244,232,0.98),rgba(237,227,204,0.96))] text-[var(--text-dark)]"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
          isActive
            ? "border-[rgba(0,255,136,0.22)] bg-[rgba(47,63,27,0.92)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[rgba(177,140,255,0.28)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.14em]">
          {item.label}
        </span>
        {item.description ? (
          <span className="mt-1 block text-sm leading-5 text-[var(--text-muted)]">
            {item.description}
          </span>
        ) : null}
      </span>

      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--bark)]/72" />
    </button>
  );
}

function AdminShortcutCard({
  isActive,
  item,
  onClick,
}: Readonly<{
  isActive: boolean;
  item: CanhoesNavItem;
  onClick: () => void;
}>) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "canhoes-tap flex w-full items-center gap-3 rounded-[1.5rem] border px-4 py-4 text-left shadow-[var(--glow-green-sm)] transition-[transform,border-color,background-color,box-shadow] hover:[box-shadow:var(--glow-green-sm),var(--glow-purple-sm)] active:scale-[0.99]",
        isActive
          ? "border-[rgba(0,255,136,0.34)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.22),transparent_34%),linear-gradient(180deg,rgba(38,55,25,1),rgba(18,25,11,1))]"
          : "border-[rgba(0,255,136,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_34%),linear-gradient(180deg,rgba(34,48,22,0.98),rgba(16,23,10,0.98))]"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--neon-green)]">
          <Sparkles className="h-3.5 w-3.5" />
          {adminCopy.shell.more.admin}
        </span>
        <span className="block text-sm font-semibold text-[var(--bg-paper)]">
          {adminCopy.shell.more.adminTitle}
        </span>
        <span className="block text-sm text-[rgba(245,237,224,0.72)]">
          {adminCopy.shell.more.adminDescription}
        </span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--neon-green)]" />
    </button>
  );
}
