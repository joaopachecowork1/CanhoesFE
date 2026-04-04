"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { OPEN_COMPOSE_SHEET_EVENT } from "@/lib/canhoesEvent";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesBrandMark } from "./CanhoesBrandMark";
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
  const canCompose = Boolean(eventOverview.overview?.modules.feed);
  const prefersReducedMotion = useReducedMotion();

  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsComposeSheetOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!canCompose) {
      setIsComposeSheetOpen(false);
    }
  }, [canCompose]);

  useEffect(() => {
    const handleOpenCompose = () => {
      if (!canCompose) return;
      setIsComposeSheetOpen(true);
    };

    globalThis.addEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
    return () => globalThis.removeEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
  }, [canCompose]);

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
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute -left-20 top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.16),transparent_68%)] blur-3xl"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, 24, -8, 0], y: [0, -16, 18, 0], scale: [1, 1.06, 0.98, 1] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-[-5rem] top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(177,140,255,0.18),transparent_70%)] blur-3xl"
          animate={
            prefersReducedMotion
              ? undefined
              : { x: [0, -26, 10, 0], y: [0, 20, -14, 0], scale: [1, 0.96, 1.04, 1] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.18),transparent_65%)]"
      />

      <header className="sticky top-0 z-40 border-b border-[rgba(212,184,150,0.12)] bg-[rgba(12,15,9,0.8)] backdrop-blur-[24px]">
        <div className="page-shell-wide pb-3 pt-3">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="page-hero editorial-shell border-[var(--border-subtle)] bg-[var(--bg-deep)]/94 px-4 py-4 text-[var(--text-primary)] shadow-[var(--shadow-panel)] sm:px-5 sm:py-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <CanhoesBrandMark />
                <p className="body-small text-[rgba(245,237,224,0.88)]">{pageTitle}</p>
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
                  <p className="label text-[rgba(245,237,224,0.7)]">Perfil</p>
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
          </motion.div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(7.2rem+env(safe-area-inset-bottom,0px))]">
        <div className={cn(isEventHomePath ? "page-shell-wide" : "page-shell", "w-full")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16, scale: 0.992 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "mx-auto w-full",
                isEventHomePath ? "max-w-[var(--page-max-width)]" : "max-w-[var(--page-content-width)]"
              )}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CanhoesBottomTabs
        isComposeOpen={isComposeSheetOpen}
        leftItems={bottomLeftEntries}
        onCompose={() => setIsComposeSheetOpen(true)}
        rightItems={bottomRightEntries}
        showCompose={canCompose}
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
