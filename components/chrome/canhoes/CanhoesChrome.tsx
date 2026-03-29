"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { CanhoesMoreSheet } from "./CanhoesMoreSheet";
import { CanhoesPhaseHud } from "./CanhoesPhaseHud";
import {
  BOTTOM_LEFT_NAV_ITEMS,
  getDynamicBottomNavItem,
  getPrimaryRightNavItem,
  getPageTitle,
  isMoreSectionActive,
} from "./canhoesNavigation";

export function CanhoesChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const isLocalMode = IS_LOCAL_MODE;
  const eventOverview = useEventOverview();

  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);

  useEffect(() => {
    setIsMoreSheetOpen(false);
    setIsComposeSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOpenCompose = () => setIsComposeSheetOpen(true);
    window.addEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
    return () => window.removeEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
  }, []);

  const pageTitle = getPageTitle(pathname);
  const isEventHomePath =
    pathname === "/canhoes" ||
    pathname === "/canhoes/" ||
    pathname === "/canhoes/home";

  const userLabel = useMemo(() => {
    const displayName = user?.name?.trim();
    if (displayName) return displayName;
    if (user?.email) return user.email;
    return "Membro";
  }, [user?.email, user?.name]);

  const primaryRightItem = useMemo(
    () =>
      getPrimaryRightNavItem({
        isAdmin,
        isLocalMode,
        overview: eventOverview.overview,
      }),
    [eventOverview.overview, isAdmin, isLocalMode]
  );

  const dynamicBottomItem = useMemo(
    () =>
      getDynamicBottomNavItem({
        isAdmin,
        isLocalMode,
        primaryItemId: primaryRightItem.id,
        overview: eventOverview.overview,
      }),
    [eventOverview.overview, isAdmin, isLocalMode, primaryRightItem.id]
  );

  const isMoreActive = Boolean(pathname) && isMoreSectionActive({
    dynamicItem: dynamicBottomItem,
    isAdmin,
    isLocalMode,
    overview: eventOverview.overview,
    pathname: pathname ?? "",
    primaryRightItem,
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

      <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[var(--bg-void)]/94 backdrop-blur-xl">
        <div className="page-shell-wide pb-3 pt-3">
          <div className="page-hero border-[var(--border-subtle)] bg-[var(--bg-deep)]/94 px-4 py-4 text-[var(--text-primary)] shadow-[var(--shadow-panel)] sm:px-5 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[var(--beige)]">
                  <span className="inline-flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-[var(--neon-green)]" />
                    <span className="label">Canhões do Ano</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="heading-2 text-[var(--text-primary)] [text-shadow:var(--glow-green-sm)]">
                    Canhoes do Ano
                  </h1>
                  <p className="body-small text-[var(--beige)]/80">{pageTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLogged ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-11 rounded-full px-3 text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
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
                    "min-h-11 rounded-full border px-3",
                    isMoreActive || isMoreSheetOpen
                      ? "border-[var(--border-neon)] bg-[var(--accent)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  )}
                  onClick={() => setIsMoreSheetOpen(true)}
                  aria-label="Abrir menu da edição"
                  title="Menu da edição"
                >
                  <Menu className="h-4 w-4" strokeWidth={2.1} />
                  <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                    Menu
                  </span>
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex min-h-11 items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2">
                <div className="min-w-0">
                  <p className="label text-[var(--beige)]/68">Perfil</p>
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
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
        leftItems={[BOTTOM_LEFT_NAV_ITEMS[0], BOTTOM_LEFT_NAV_ITEMS[1]]}
        pathname={pathname ?? ""}
        onCompose={() => setIsComposeSheetOpen(true)}
        onNavigate={(href) => router.push(href)}
        rightItems={[primaryRightItem, dynamicBottomItem]}
      />

      <CanhoesMoreSheet
        isAdmin={isAdmin}
        isLocalMode={isLocalMode}
        overview={eventOverview.overview}
        open={isMoreSheetOpen}
        onOpenChange={setIsMoreSheetOpen}
        onNavigate={(href) => {
          setIsMoreSheetOpen(false);
          router.push(href);
        }}
        primaryIds={[
          ...BOTTOM_LEFT_NAV_ITEMS.map((item) => item.id),
          primaryRightItem.id,
          dynamicBottomItem.id,
        ]}
      />

      <CanhoesComposeSheet
        open={isComposeSheetOpen}
        onOpenChange={setIsComposeSheetOpen}
        onDone={() => setIsComposeSheetOpen(false)}
      />
    </div>
  );
}
