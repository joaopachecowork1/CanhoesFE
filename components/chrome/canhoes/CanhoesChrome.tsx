"use client";

import React, { useEffect, useState } from "react";
import { LogOut, Menu, ScrollText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { OPEN_COMPOSE_SHEET_EVENT } from "@/lib/canhoesEvent";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesComposeSheet } from "./CanhoesComposeSheet";
import { CanhoesFloatingActionMenu } from "./CanhoesFloatingActionMenu";
import { CanhoesPhaseHud } from "./CanhoesPhaseHud";
import { useCanhoesShellNavigation } from "./useCanhoesShellNavigation";

export function CanhoesChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isLocalMode = IS_LOCAL_MODE;
  const eventOverview = useEventOverview();
  const isAdmin =
    Boolean(user?.isAdmin) || Boolean(eventOverview.overview?.permissions.isAdmin);

  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsComposeSheetOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOpenCompose = () => setIsComposeSheetOpen(true);
    window.addEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
    return () => window.removeEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
  }, []);

  const {
    bottomLeftEntries,
    bottomRightEntries,
    isEventHomePath,
    menuPrimaryIds,
    pageTitle,
    userLabel,
  } = useCanhoesShellNavigation({
    isAdmin,
    isLocalMode,
    isMenuOpen,
    onOpenMenu: () => setIsMenuOpen(true),
    overview: eventOverview.overview,
    pathname,
    router,
    user,
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

      <header className="sticky top-0 z-40 border-b border-[rgba(212,184,150,0.12)] bg-[rgba(12,15,9,0.78)] backdrop-blur-[24px]">
        <div className="page-shell-wide pb-3 pt-3">
          <div className="page-hero editorial-shell border-[var(--border-subtle)] bg-[var(--bg-deep)]/94 px-4 py-4 text-[var(--text-primary)] shadow-[var(--shadow-panel)] sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[var(--beige)]">
                  <span className="inline-flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-[var(--neon-green)]" />
                    <span className="label text-[rgba(245,237,224,0.72)]">Canhoes do Ano</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="heading-2 text-[var(--bg-paper)] [text-shadow:var(--glow-green-sm)]">
                    Canhoes do Ano
                  </h1>
                  <p className="body-small text-[rgba(245,237,224,0.72)]">{pageTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLogged ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.76)] px-3 text-[var(--bg-paper)] hover:bg-[rgba(38,48,24,0.92)]"
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
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.76)] px-3 text-[var(--bg-paper)] hover:bg-[rgba(38,48,24,0.92)]"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  aria-expanded={isMenuOpen}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-4 w-4" />
                  <span className="hidden sm:inline">Menu</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="canhoes-shell-chip inline-flex min-h-11 items-center rounded-full px-4 py-2">
                <div className="min-w-0">
                  <p className="label text-[rgba(245,237,224,0.58)]">Perfil</p>
                  <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                    {userLabel}
                  </p>
                </div>
              </div>

              <CanhoesPhaseHud
                event={eventOverview.event}
                isLoading={eventOverview.isLoading}
                overview={eventOverview.overview}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(5.6rem+env(safe-area-inset-bottom,0px))]">
        <div className={cn(isEventHomePath ? "page-shell-wide" : "page-shell", "w-full")}>
          <div
            className={cn(
              "mx-auto w-full",
              isEventHomePath ? "max-w-[var(--page-max-width)]" : "max-w-[var(--page-content-width)]"
            )}
          >
            {children}
          </div>
        </div>
      </main>

      <CanhoesBottomTabs
        isComposeOpen={isComposeSheetOpen}
        leftItems={bottomLeftEntries}
        onCompose={() => setIsComposeSheetOpen(true)}
        rightItems={bottomRightEntries}
      />

      <CanhoesFloatingActionMenu
        isOpen={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        isAdmin={isAdmin}
        isLocalMode={isLocalMode}
        overview={eventOverview.overview}
        primaryIds={menuPrimaryIds}
        onNavigate={(href) => {
          setIsMenuOpen(false);
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
