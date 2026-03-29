"use client";

import type { LucideIcon } from "lucide-react";
import type { EventOverviewDto } from "@/lib/api/types";

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getVisibleMoreNavItems } from "./canhoesNavigation";

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
  // This sheet only exposes modules that are not already promoted into the
  // primary bottom navigation for the current phase.
  const visibleLinks = getVisibleMoreNavItems({
    excludedIds: primaryIds,
    isAdmin,
    isLocalMode,
    overview,
  });
  const adminLink = visibleLinks.find((link) => link.requiresAdmin);
  const exploreLinks = visibleLinks.filter((link) => !link.requiresAdmin);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="border-[var(--border-subtle)] bg-[var(--bg-deep)] pb-safe text-[var(--text-primary)] [&_[data-slot=sheet-close]]:border-[var(--border-subtle)] [&_[data-slot=sheet-close]]:bg-[var(--bg-surface)] [&_[data-slot=sheet-close]]:text-[var(--text-primary)] [&_[data-slot=sheet-close]]:opacity-90"
      >
        <SheetHeader className="space-y-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-[var(--border-moss)]" />
          <p className="label text-left text-[var(--beige)]/72">Mapa da edição</p>
          <SheetTitle className="text-left text-[var(--text-primary)]">
            Outras áreas da edição
          </SheetTitle>
          <SheetDescription className="body-small text-left text-[var(--beige)]/72">
            Atalhos para áreas menos usadas nesta fase, incluindo o acesso ao
            painel de administração quando estiver disponível.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <section className="canhoes-glass rounded-[var(--radius-lg-token)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="label text-[var(--beige)]/70">Atalhos</p>
                <h3 className="heading-3 text-[var(--text-primary)]">
                  Áreas fora da navegação principal
                </h3>
                <p className="body-small text-[var(--beige)]/68">
                  Usa este painel para entrar em áreas secundárias sem perder o
                  foco da navegação principal.
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="label text-[var(--beige)]/60">Total</p>
                <p className="text-lg font-semibold text-[var(--neon-green)] [text-shadow:var(--glow-green-sm)]">
                  {visibleLinks.length}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="label text-[var(--beige)]/72">Explorar</p>
              <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {exploreLinks.length} atalhos
              </p>
            </div>
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
              <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--beige)]/74">
                Não há outras áreas abertas nesta fase da edição.
              </div>
            )}
          </section>

          {adminLink ? (
            <>
              <Separator className="bg-[var(--border-subtle)]" />
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="label text-[var(--beige)]/72">Administracao</p>
                  <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--border-neon)]/60 bg-[var(--accent)] px-3 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--neon-green)]">
                    Admin
                  </span>
                </div>

                <MoreLinkCard
                  description={adminLink.description}
                  icon={adminLink.icon}
                  label={adminLink.label}
                  onClick={() => onNavigate(adminLink.href)}
                  tone="admin"
                />
              </section>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
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
          ? "border-[var(--border-neon)]/55 bg-[var(--accent)] shadow-[var(--glow-green-sm)] hover:border-[var(--border-neon)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-panel)] hover:border-[var(--border-neon)]/45"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-[background-color,color,border-color,box-shadow]",
          isAdminTone
            ? "border-[var(--border-neon)]/60 bg-[var(--accent)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[var(--border-moss)] bg-[var(--bg-void)] text-[var(--beige)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 space-y-1">
        <span className="block font-[var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
          {label}
        </span>
        {description ? (
          <span className="block text-sm leading-5 text-[var(--beige)]/72">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
