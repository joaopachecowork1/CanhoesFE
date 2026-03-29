"use client";

import type { LucideIcon } from "lucide-react";
import { PlusCircle } from "lucide-react";

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

import { getVisibleMoreNavItems } from "./canhoesNavigation";

export function CanhoesMoreSheet({
  isAdmin,
  isLocalMode,
  onCompose,
  onNavigate,
  onOpenChange,
  open,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode: boolean;
  onCompose: () => void;
  onNavigate: (href: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  open: boolean;
}>) {
  const visibleLinks = getVisibleMoreNavItems({ isAdmin, isLocalMode });
  const adminLink = visibleLinks.find((link) => link.requiresAdmin);
  const exploreLinks = visibleLinks.filter((link) => !link.requiresAdmin);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-safe">
        <SheetHeader className="space-y-2 pb-2">
          <p className="label text-[var(--beige)]/72">Mais opções</p>
          <SheetTitle className="text-left">Atalhos secundários do evento</SheetTitle>
          <SheetDescription className="body-small text-left text-[var(--beige)]/68">
            A barra inferior fica focada no essencial. Este painel junta as áreas
            menos frequentes e o acesso de administração quando existir.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="canhoes-glass rounded-[var(--radius-lg-token)] p-4">
              <div className="space-y-2">
                <p className="label text-[var(--beige)]/72">Atalho rápido</p>
                <h3 className="heading-3 text-[var(--text-primary)]">
                  Novo registo no arquivo
                </h3>
                <p className="body-small text-[var(--beige)]/68">
                  Mantemos a criação acessível a partir daqui para não perder a
                  ação rápida quando o “+” passou a abrir o painel de mais.
                </p>
              </div>

              <Button
                variant="secondary"
                className="mt-4 w-full justify-center gap-2 lg:w-auto"
                onClick={onCompose}
              >
                <PlusCircle className="h-4 w-4" />
                Criar post
              </Button>
            </section>

            <section className="rounded-[var(--radius-lg-token)] border border-[var(--border-subtle)] bg-[rgba(245,237,224,0.08)] p-4">
              <p className="label text-[var(--beige)]/72">Resumo</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                {exploreLinks.length + (adminLink ? 1 : 0)} secções disponíveis
              </p>
              <p className="mt-1 text-sm text-[var(--beige)]/68">
                A navegação secundária fica agrupada aqui para reduzir ruído na
                barra principal e dar mais espaço ao feed.
              </p>
            </section>
          </div>

          <div className="space-y-2">
            <p className="label text-[var(--beige)]/72">Explorar</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
          </div>

          {adminLink ? (
            <>
              <Separator className="bg-[var(--border-subtle)]" />
              <div className="space-y-2">
                <p className="label text-[var(--beige)]/72">Administração</p>
                <MoreLinkCard
                  description={adminLink.description}
                  icon={adminLink.icon}
                  label={adminLink.label}
                  onClick={() => onNavigate(adminLink.href)}
                  tone="admin"
                />
              </div>
            </>
          ) : null}

          {isLocalMode ? (
            <p className="body-small rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[rgba(245,237,224,0.08)] px-3 py-2 text-[var(--beige)]/72">
              Algumas áreas ficam ocultas em modo local para evitar navegação
              para fluxos que dependem do evento real.
            </p>
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
        "canhoes-tap flex min-h-14 items-start gap-3 rounded-[var(--radius-md-token)] border px-4 py-3 text-left transition-[transform,border-color,background-color,box-shadow] active:scale-[0.99]",
        isAdminTone
          ? "border-[var(--border-neon)]/45 bg-[rgba(0,255,136,0.08)] shadow-[var(--glow-green-sm)] hover:border-[var(--border-neon)]"
          : "border-[var(--border-subtle)] bg-[rgba(245,237,224,0.08)] shadow-[var(--shadow-paper)] hover:border-[var(--border-neon)]/35"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isAdminTone
            ? "bg-[var(--neon-green)] text-[var(--bg-void)]"
            : "bg-[var(--bg-deep)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)]"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-semibold text-[var(--text-primary)]">
          {label}
        </span>
        {description ? (
          <span className="block text-xs leading-5 text-[var(--beige)]/68">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
