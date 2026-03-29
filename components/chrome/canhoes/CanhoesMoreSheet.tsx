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
        className="canhoes-sheet border-[rgba(212,184,150,0.16)] pb-safe text-[var(--text-primary)] [&_[data-slot=sheet-close]]:border-[rgba(212,184,150,0.12)] [&_[data-slot=sheet-close]]:bg-[rgba(28,34,18,0.9)] [&_[data-slot=sheet-close]]:text-[var(--bg-paper)] [&_[data-slot=sheet-close]]:opacity-90"
      >
        <SheetHeader className="space-y-2 border-b border-[rgba(212,184,150,0.12)] pb-4">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-[rgba(122,173,58,0.38)]" />
          <p className="label text-left text-[rgba(245,237,224,0.68)]">Mapa da edicao</p>
          <SheetTitle className="text-left text-[var(--bg-paper)]">
            Mais areas desta edicao
          </SheetTitle>
          <SheetDescription className="body-small text-left text-[rgba(245,237,224,0.72)]">
            Atalhos para categorias, arquivo, wishlist e outras areas que nao
            precisam de ficar sempre na navegacao principal.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <section className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,11,0.9)] px-4 py-4 shadow-[var(--shadow-panel)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="label text-[rgba(245,237,224,0.64)]">Atalhos</p>
                <h3 className="heading-3 text-[var(--bg-paper)]">Areas secundarias</h3>
                <p className="body-small text-[rgba(245,237,224,0.68)]">
                  Mantem o foco no essencial sem perder acesso ao resto da
                  edicao.
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="label text-[rgba(245,237,224,0.52)]">Total</p>
                <p className="text-lg font-semibold text-[var(--neon-green)] [text-shadow:var(--glow-green-sm)]">
                  {visibleLinks.length}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="label text-[rgba(245,237,224,0.68)]">Explorar</p>
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
              <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.8)] px-4 py-3 text-sm text-[rgba(245,237,224,0.72)]">
                Nao ha outras areas abertas nesta fase.
              </div>
            )}
          </section>

          {adminLink ? (
            <>
              <Separator className="bg-[rgba(212,184,150,0.12)]" />
              <section className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="label text-[rgba(245,237,224,0.68)]">Administracao</p>
                  <span className="inline-flex min-h-8 items-center rounded-full border border-[rgba(0,255,136,0.28)] bg-[rgba(38,54,26,0.9)] px-3 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--neon-green)]">
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
          ? "border-[rgba(0,255,136,0.28)] bg-[rgba(38,54,26,0.9)] shadow-[var(--glow-green-sm)] hover:border-[rgba(0,255,136,0.38)]"
          : "border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.84)] shadow-[var(--shadow-panel)] hover:border-[rgba(212,184,150,0.22)]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-[background-color,color,border-color,box-shadow]",
          isAdminTone
            ? "border-[rgba(0,255,136,0.28)] bg-[rgba(18,28,12,0.92)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
            : "border-[rgba(212,184,150,0.14)] bg-[rgba(16,20,11,0.92)] text-[var(--beige)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 space-y-1">
        <span className="block font-[var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--bg-paper)]">
          {label}
        </span>
        {description ? (
          <span className="block text-sm leading-5 text-[rgba(245,237,224,0.72)]">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
