"use client";

import type { LucideIcon } from "lucide-react";

import type { EventOverviewDto } from "@/lib/api/types";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getVisibleMoreAdminItem, getVisibleMoreNavItems } from "./canhoesNavigation";

export function CanhoesMoreSheet({
  isAdmin,
  isLocalMode,
  onNavigate,
  onOpenChange,
  open,
  overview,
  primaryIds = [],
}: Readonly<{
  isAdmin: boolean;
  isLocalMode: boolean;
  onNavigate: (href: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  open: boolean;
  overview?: EventOverviewDto | null;
  primaryIds?: string[];
}>) {
  const exploreLinks = getVisibleMoreNavItems({
    excludedIds: primaryIds,
    isAdmin,
    isLocalMode,
    overview,
  });
  const adminLink = getVisibleMoreAdminItem({
    excludedIds: primaryIds,
    isAdmin,
    isLocalMode,
    overview,
  });
  const totalShortcuts = exploreLinks.length + (adminLink ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="canhoes-sheet border-[rgba(212,184,150,0.16)] pb-safe text-[var(--text-primary)] [&_[data-slot=sheet-close]]:border-[rgba(212,184,150,0.12)] [&_[data-slot=sheet-close]]:bg-[rgba(28,34,18,0.9)] [&_[data-slot=sheet-close]]:text-[var(--bg-paper)] [&_[data-slot=sheet-close]]:opacity-90"
      >
        <SheetHeader className="space-y-2 border-b border-[rgba(212,184,150,0.12)] pb-4">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-[rgba(122,173,58,0.38)]" />
          <p className="label text-left text-[rgba(245,237,224,0.68)]">
            {adminCopy.shell.more.kicker}
          </p>
          <SheetTitle className="text-left text-[var(--bg-paper)]">
            {adminCopy.shell.more.title}
          </SheetTitle>
          <SheetDescription className="body-small text-left text-[rgba(245,237,224,0.72)]">
            {adminCopy.shell.more.description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <section className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="label text-[var(--text-muted)]">
                  {adminCopy.shell.more.summaryLabel}
                </p>
                <h3 className="heading-3 text-[var(--text-dark)]">
                  {adminCopy.shell.more.summaryTitle}
                </h3>
                <p className="body-small text-[var(--text-muted)]">
                  {adminCopy.shell.more.summaryDescription}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="label text-[var(--text-muted)]">
                  {adminCopy.shell.more.total}
                </p>
                <p className="text-lg font-semibold text-[var(--accent-purple-deep)] [text-shadow:var(--glow-purple-sm)]">
                  {totalShortcuts}
                </p>
              </div>
            </div>
          </section>

          <MoreSection
            label={adminCopy.shell.more.explore}
            meta={`${exploreLinks.length} ${adminCopy.shell.more.shortcuts}`}
          >
            {exploreLinks.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {exploreLinks.map((link) => (
                  <MoreLinkCard
                    key={link.href}
                    description={link.description}
                    icon={link.icon}
                    label={link.label}
                    onClick={() => onNavigate(link.href)}
                  />
                ))}
              </div>
            ) : (
              <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-3 text-sm text-[var(--text-muted)]">
                {adminCopy.shell.more.empty}
              </div>
            )}
          </MoreSection>

          {adminLink ? (
            <>
              <Separator className="bg-[rgba(212,184,150,0.12)]" />
              <MoreSection
                label={adminCopy.shell.more.admin}
                meta="Admin"
                metaTone="admin"
              >
                <AdminShortcutCard
                  description={adminCopy.shell.more.adminDescription}
                  icon={adminLink.icon}
                  title={adminCopy.shell.more.adminTitle}
                  actionLabel={adminCopy.shell.more.adminAction}
                  onClick={() => onNavigate(adminLink.href)}
                />
              </MoreSection>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MoreSection({
  children,
  label,
  meta,
  metaTone = "default",
}: Readonly<{
  children: React.ReactNode;
  label: string;
  meta?: string;
  metaTone?: "admin" | "default";
}>) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="label text-[rgba(245,237,224,0.68)]">{label}</p>
        {meta ? (
          <span
            className={cn(
              "inline-flex min-h-8 items-center rounded-full border px-3 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em]",
              metaTone === "admin"
                ? "border-[rgba(0,255,136,0.28)] bg-[rgba(38,54,26,0.9)] text-[var(--neon-green)]"
                : "border-[rgba(177,140,255,0.3)] bg-[rgba(34,28,48,0.9)] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple)]"
            )}
          >
            {meta}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AdminShortcutCard({
  actionLabel,
  description,
  icon: Icon,
  onClick,
  title,
}: Readonly<{
  actionLabel: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  title: string;
}>) {
  return (
    <section className="rounded-[var(--radius-lg-token)] border border-[rgba(0,255,136,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.16),transparent_36%),linear-gradient(180deg,rgba(34,48,22,0.96),rgba(17,24,11,0.98))] px-4 py-4 shadow-[var(--glow-green-sm)]">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple)]">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-[var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--bg-paper)]">
            {title}
          </h3>
          <p className="text-sm leading-5 text-[rgba(245,237,224,0.74)]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Button type="button" className="w-full sm:w-auto" onClick={onClick}>
          {actionLabel}
        </Button>
      </div>
    </section>
  );
}

function MoreLinkCard({
  description,
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: Readonly<{
  description?: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "admin" | "default";
}>) {
  const isAdminTone = tone === "admin";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "canhoes-tap flex min-h-[4.75rem] items-start gap-3 rounded-[var(--radius-md-token)] border px-4 py-3 text-left transition-[transform,border-color,background-color,box-shadow] active:scale-[0.99]",
        isAdminTone
          ? "border-[rgba(0,255,136,0.28)] bg-[rgba(38,54,26,0.9)] shadow-[var(--glow-green-sm)] hover:border-[rgba(0,255,136,0.38)]"
          : "border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,rgba(251,244,232,0.98),rgba(237,227,204,0.96))] text-[var(--text-dark)] shadow-[var(--shadow-paper-soft)] hover:border-[rgba(177,140,255,0.28)] hover:[box-shadow:var(--glow-purple-sm)]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-[background-color,color,border-color,box-shadow]",
          isAdminTone
            ? "border-[rgba(0,255,136,0.28)] bg-[rgba(18,28,12,0.92)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 space-y-1">
        <span
          className={cn(
            "block font-[var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.14em]",
            isAdminTone ? "text-[var(--bg-paper)]" : "text-[var(--text-dark)]"
          )}
        >
          {label}
        </span>
        {description ? (
          <span
            className={cn(
              "block text-sm leading-5",
              isAdminTone ? "text-[rgba(245,237,224,0.72)]" : "text-[var(--text-muted)]"
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
