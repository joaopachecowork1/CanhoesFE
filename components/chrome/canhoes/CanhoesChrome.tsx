"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LogOut, Menu, ScrollText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { getPageTitle, isMoreSectionActive } from "./canhoesNavigation";

export function CanhoesChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const isLocalMode = IS_LOCAL_MODE;

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

  const isMoreActive = Boolean(pathname) && isMoreSectionActive({
    isAdmin,
    isLocalMode,
    pathname: pathname ?? "",
  });

  return (
    <div
      data-theme="canhoes"
      className="bg-circuit relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.18),transparent_65%)]"
      />

      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-void)] backdrop-blur-xl">
        <div className="page-shell-wide pb-3 pt-3">
          <div className="page-hero px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[var(--beige)]">
                  <span className="inline-flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-[var(--neon-green)]" />
                    <span className="label">Arquivo social</span>
                  </span>
                  {isLocalMode ? (
                    <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--border-subtle)] px-3 font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--neon-amber)]">
                      Local
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <h1 className="heading-2 text-[var(--text-primary)] [text-shadow:var(--glow-green-sm)]">
                    Canhoes do Ano
                  </h1>
                  <p className="type-subhead text-[var(--beige)]/78">
                    {pageTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLogged ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 rounded-full px-3"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sair</span>
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "min-h-11 rounded-full px-3",
                    isMoreActive || isMoreSheetOpen
                      ? "border-[var(--border-neon)] bg-[var(--accent)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  )}
                  onClick={() => setIsMoreSheetOpen(true)}
                  aria-label="Abrir menu de mais opcoes"
                  title="Mais opcoes"
                >
                  <Menu className="h-4 w-4" strokeWidth={2.1} />
                  <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                    Menu
                  </span>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="canhoes-glass inline-flex min-h-11 items-center rounded-full px-4 py-2">
                <div className="min-w-0">
                  <p className="label text-[var(--beige)]/68">Perfil</p>
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {userLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
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
        isComposeOpen={isComposeSheetOpen}
        pathname={pathname ?? ""}
        onCompose={() => setIsComposeSheetOpen(true)}
        onNavigate={(href) => router.push(href)}
      />

      <CanhoesMoreSheet
        isAdmin={isAdmin}
        isLocalMode={isLocalMode}
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
