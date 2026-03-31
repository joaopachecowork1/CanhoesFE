"use client";

import { useId } from "react";
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
        className="canhoes-sheet flex max-h-[88svh] flex-col border-[rgba(212,184,150,0.16)] pb-safe text-[var(--text-primary)] [&_[data-slot=sheet-close]]:border-[rgba(212,184,150,0.12)] [&_[data-slot=sheet-close]]:bg-[rgba(28,34,18,0.9)] [&_[data-slot=sheet-close]]:text-[var(--bg-paper)] [&_[data-slot=sheet-close]]:opacity-90"
      >
        <SheetHeader className="space-y-2 border-b border-[rgba(212,184,150,0.12)] pb-4">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-[rgba(177,140,255,0.46)] [box-shadow:var(--glow-purple-sm)]" />
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-3 flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(177,140,255,0.2)] bg-[rgba(18,22,11,0.6)] px-3 py-2">
            <p className="text-sm text-[rgba(245,237,224,0.82)]">
              {adminCopy.shell.more.total}:{" "}
              <span className="font-semibold text-[var(--accent-purple-soft)]">
                {totalShortcuts}
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>

          <MoreSection
            label={adminCopy.shell.more.explore}
            meta={`${exploreLinks.length} ${adminCopy.shell.more.shortcuts}`}
            metaTone="default"
            title={adminCopy.shell.more.exploreTitle}
            description={adminCopy.shell.more.exploreDescription}
          >
            {exploreLinks.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2" role="list" aria-label={adminCopy.shell.more.exploreTitle}>
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
              <Separator className="bg-[rgba(177,140,255,0.18)]" />
              <MoreSection
                label={adminCopy.shell.more.admin}
                meta="Admin"
                metaTone="admin"
                title={adminCopy.shell.more.adminTitle}
                description={adminCopy.shell.more.adminSectionDescription}
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

          <div className="sticky bottom-0 mt-4 border-t border-[rgba(212,184,150,0.12)] bg-[linear-gradient(180deg,rgba(12,15,9,0),rgba(12,15,9,0.92)_34%)] pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Fechar menu
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MoreSection({
  children,
  description,
  label,
  meta,
  metaTone = "default",
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  label: string;
  meta?: string;
  metaTone?: "admin" | "default";
  title: string;
}>) {
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={cn(
        "space-y-3 rounded-[var(--radius-lg-token)] border px-4 py-4",
        metaTone === "admin"
          ? "border-[rgba(0,255,136,0.16)] bg-[linear-gradient(180deg,rgba(16,22,11,0.92),rgba(10,13,8,0.96))] shadow-[var(--glow-green-sm)]"
          : "border-[rgba(177,140,255,0.16)] bg-[linear-gradient(180deg,rgba(18,22,11,0.88),rgba(10,13,8,0.92))] shadow-[var(--glow-purple-sm)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="label text-[rgba(245,237,224,0.62)]">{label}</p>
          <h3 id={headingId} className="heading-3 text-[var(--bg-paper)]">
            {title}
          </h3>
          <p className="body-small text-[rgba(245,237,224,0.72)]">{description}</p>
        </div>
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

      <div className="editorial-divider bg-[linear-gradient(90deg,transparent,rgba(177,140,255,0.22),transparent)]" />
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
}: Readonly<{
  description?: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="canhoes-tap flex min-h-[4.1rem] items-start gap-3 rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,rgba(251,244,232,0.98),rgba(237,227,204,0.96))] px-4 py-3 text-left text-[var(--text-dark)] shadow-[var(--shadow-paper-soft)] transition-[transform,border-color,background-color,box-shadow] hover:border-[rgba(177,140,255,0.28)] hover:[box-shadow:var(--glow-purple-sm)] active:scale-[0.99]"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple)]">
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 space-y-1">
        <span className="block font-[var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dark)]">
          {label}
        </span>
        {description ? (
          <span className="block text-sm leading-5 text-[var(--text-muted)]">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
