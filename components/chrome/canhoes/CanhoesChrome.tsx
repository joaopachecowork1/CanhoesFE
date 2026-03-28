"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Menu, ScrollText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";

const PAGE_TITLES = [
  { href: "/canhoes/admin", label: "Admin" },
  { href: "/canhoes/amigo-secreto", label: "Amigo secreto" },
  { href: "/canhoes/categorias", label: "Categorias" },
  { href: "/canhoes/feed", label: "Feed" },
  { href: "/canhoes/gala", label: "Gala" },
  { href: "/canhoes/medidas", label: "Medidas" },
  { href: "/canhoes/nomeacoes", label: "Nomeacoes" },
  { href: "/canhoes/stickers", label: "Stickers" },
  { href: "/canhoes/votacao", label: "Votacao" },
  { href: "/canhoes/wishlist", label: "Wishlist" },
] as const;

function getPageTitle(pathname: string | null) {
  if (!pathname) return "Feed";

  const matchedPage = PAGE_TITLES.find(({ href }) => pathname.startsWith(href));
  return matchedPage?.label ?? "Feed";
}

export function CanhoesChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);

  useEffect(() => {
    setIsMoreSheetOpen(false);
    setIsComposeSheetOpen(false);
  }, [pathname]);

  const pageTitle = getPageTitle(pathname);
  const isFeedPath =
    pathname === "/canhoes" ||
    pathname === "/canhoes/" ||
    pathname === "/canhoes/feed";

  const userLabel = useMemo(() => {
    const displayName = user?.name?.trim();
    if (displayName) return displayName;
    if (user?.email) return user.email;
    return "Membro";
  }, [user?.email, user?.name]);

  return (
    <div
      data-theme="canhoes"
      className="bg-circuit relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.18),transparent_65%)]"
      />

      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[rgba(15,18,9,0.82)] backdrop-blur-xl">
        <div className="page-shell-wide pb-3 pt-3">
          <div className="page-hero px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex items-center gap-2 text-[var(--neon-green)]">
                  <ScrollText className="h-4 w-4" />
                  <span className="label text-[var(--beige)]">Canhoes</span>
                </div>

                <div className="space-y-1">
                  <h1 className="heading-2 truncate text-[var(--text-primary)] [text-shadow:var(--glow-green-sm)]">
                    Canhoes do Ano
                  </h1>
                  <p className="type-subhead text-[var(--beige)]/78">
                    {pageTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div className="canhoes-glass rounded-full px-3 py-2 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--beige)]/70">
                    Perfil
                  </p>
                  <p className="max-w-[11rem] truncate text-sm font-semibold text-[var(--text-primary)]">
                    {userLabel}
                  </p>
                </div>

                {isLogged ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      logout();
                    }}
                  >
                    Sair
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => setIsMoreSheetOpen(true)}
                  aria-label="Abrir menu"
                  title={user?.email ?? "Mais opcoes"}
                >
                  <Menu className="h-5 w-5" strokeWidth={2.1} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        <div
          className={cn(
            isFeedPath ? "page-shell-wide" : "page-shell",
            "w-full"
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              isFeedPath
                ? "max-w-[var(--page-max-width)]"
                : "max-w-[var(--page-content-width)]"
            )}
          >
            {children}
          </div>
        </div>
      </main>

      <CanhoesBottomTabs
        pathname={pathname ?? ""}
        onNavigate={(href) => router.push(href)}
        onCompose={() => setIsComposeSheetOpen(true)}
      />

      <CanhoesMoreSheet
        open={isMoreSheetOpen}
        onOpenChange={setIsMoreSheetOpen}
        onNavigate={(href) => {
          setIsMoreSheetOpen(false);
          router.push(href);
        }}
      />

      <CanhoesComposeSheet
        open={isComposeSheetOpen}
        onOpenChange={setIsComposeSheetOpen}
        onDone={() => setIsComposeSheetOpen(false)}
      />
    </div>
  );
}
