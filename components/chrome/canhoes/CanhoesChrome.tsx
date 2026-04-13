"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";

import { OPEN_COMPOSE_SHEET_EVENT } from "@/lib/canhoesEvent";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAdminNavigation } from "@/hooks/useAdminNavigation";
import { IS_LOCAL_MODE } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";

import { CanhoesBottomTabs } from "./CanhoesBottomTabs";
import { CanhoesBrandMark } from "./CanhoesBrandMark";
import { CanhoesPhaseHud } from "./CanhoesPhaseHud";
import { useCanhoesShellNavigation } from "./useCanhoesShellNavigation";

const loadCanhoesAmbientBackground = () =>
  import("./CanhoesAmbientBackground").then((module) => ({
    default: module.CanhoesAmbientBackground,
  }));

const loadCanhoesComposeSheet = () =>
  import("./CanhoesComposeSheet").then((module) => ({
    default: module.CanhoesComposeSheet,
  }));

const loadCanhoesFloatingActionMenu = () =>
  import("./CanhoesFloatingActionMenu").then((module) => ({
    default: module.CanhoesFloatingActionMenu,
  }));

const LazyCanhoesAmbientBackground = dynamic(loadCanhoesAmbientBackground, {
  loading: () => null,
  ssr: false,
});

const LazyCanhoesComposeSheet = dynamic(loadCanhoesComposeSheet, {
  loading: () => null,
  ssr: false,
});

const LazyCanhoesFloatingActionMenu = dynamic(loadCanhoesFloatingActionMenu, {
  loading: () => null,
  ssr: false,
});

export function CanhoesChrome({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLogged, logout, user } = useAuth();
  const isLocalMode = IS_LOCAL_MODE;
  const eventOverview = useEventOverview();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const canCompose = Boolean(eventOverview.overview?.modules.feed);
  const { navigateToAdmin: handleNavigateAdmin } = useAdminNavigation({
    adminLoading,
    overviewReady: Boolean(eventOverview.overview),
    router,
  });
  const prefersReducedMotion = useReducedMotion();

  const [isComposeSheetOpen, setIsComposeSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasOpenedComposeSheet, setHasOpenedComposeSheet] = useState(false);
  const [hasOpenedMenu, setHasOpenedMenu] = useState(false);
  const [showAmbientBackground, setShowAmbientBackground] = useState(false);

  const handleComposeSheetChange = (open: boolean) => {
    if (open) {
      setHasOpenedComposeSheet(true);
    }

    setIsComposeSheetOpen(open);
  };

  const handleMenuOpenChange = (open: boolean) => {
    if (open) {
      setHasOpenedMenu(true);
    }

    setIsMenuOpen(open);
  };

  // Close overlays on navigation
  useEffect(() => {
    setIsComposeSheetOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Close compose sheet if module is disabled
  useEffect(() => {
    if (!canCompose) {
      setIsComposeSheetOpen(false);
    }
  }, [canCompose]);

  // Listen for global compose sheet open event
  useEffect(() => {
    const handleOpenCompose = () => {
      if (!canCompose) return;
      setHasOpenedComposeSheet(true);
      setIsComposeSheetOpen(true);
    };

    globalThis.addEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
    return () => globalThis.removeEventListener(OPEN_COMPOSE_SHEET_EVENT, handleOpenCompose);
  }, [canCompose]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCanhoesFloatingActionMenu();

      if (canCompose) {
        void loadCanhoesComposeSheet();
      }
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [canCompose]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowAmbientBackground(true);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const {
    bottomLeftEntries,
    bottomRightEntries,
    isEventHomePath,
    menuPrimaryIds,
    pageContext,
    userLabel,
  } = useCanhoesShellNavigation({
    isAdmin,
    isLocalMode,
    isMenuOpen,
    onNavigateAdmin: handleNavigateAdmin,
    onOpenMenu: () => handleMenuOpenChange(true),
    overview: eventOverview.overview,
    pathname,
    router,
    user,
  });
  const headerTone =
    pageContext.tone === "social"
      ? "social"
      : pageContext.tone === "official"
        ? "official"
        : pageContext.tone === "admin"
          ? "admin"
          : "shell";

  useEffect(() => {
    const eventName = eventOverview.event?.name?.trim();
    document.title = eventName
      ? `${pageContext.title} · ${eventName}`
      : `${pageContext.title} · Canhoes`;
  }, [eventOverview.event?.name, pageContext.title]);

  return (
    <div
      data-theme="canhoes"
      className="bg-circuit relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--bg-void)] text-[var(--text-primary)]"
    >
      {showAmbientBackground ? <LazyCanhoesAmbientBackground /> : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.18),transparent_65%)]"
      />

      <header className="sticky top-0 z-40 border-b border-[rgba(212,184,150,0.12)] bg-[rgba(12,15,9,0.8)] backdrop-blur-[24px]">
        <div className="page-shell-wide pb-2 pt-2">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="page-hero canhoes-bits-panel canhoes-bits-panel--shell editorial-shell border-[var(--border-subtle)] px-3 py-3 text-[var(--text-primary)] shadow-[var(--shadow-panel)] sm:px-4 sm:py-4"
          >
            <CanhoesGlowBackdrop tone={headerTone} />

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <CanhoesBrandMark compact subtitle="Premios da edicao" />

                {!isEventHomePath ? (
                  <div className="min-w-0 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.72)] px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 border-transparent px-2 py-0.5 text-[10px] uppercase tracking-[0.14em]",
                          pageContext.tone === "social" &&
                            "bg-[rgba(177,140,255,0.16)] text-[var(--accent-purple-soft)]",
                          pageContext.tone === "official" &&
                            "bg-[rgba(0,255,136,0.12)] text-[var(--neon-green)]",
                          pageContext.tone === "admin" &&
                            "bg-[rgba(255,184,0,0.12)] text-[var(--neon-amber)]",
                          pageContext.tone === "event" &&
                            "bg-[rgba(245,237,224,0.08)] text-[rgba(245,237,224,0.86)]"
                        )}
                      >
                        {pageContext.toneLabel}
                      </Badge>
                      <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                        {pageContext.title}
                      </p>
                    </div>

                    {pageContext.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-[rgba(245,237,224,0.72)]">
                        {pageContext.description}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-1.5">
                {isLogged ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-10 h-10 w-10 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.76)] text-[var(--bg-paper)] hover:bg-[rgba(38,48,24,0.92)]"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="min-h-10 h-10 w-10 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.76)] text-[var(--bg-paper)] hover:bg-[rgba(38,48,24,0.92)]"
                  onClick={() => handleMenuOpenChange(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CanhoesDecorativeDivider
              tone={pageContext.tone === "social" ? "purple" : "moss"}
              className="mt-3"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,12,0.72)] px-3 py-1.5">
                <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                  {userLabel}
                </p>
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

      <main className="relative z-10 flex-1 overflow-y-auto pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]">
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
        onCompose={() => handleComposeSheetChange(true)}
        rightItems={bottomRightEntries}
        showCompose={canCompose}
      />

      {isMenuOpen || hasOpenedMenu ? (
        <LazyCanhoesFloatingActionMenu
          isOpen={isMenuOpen}
          onOpenChange={handleMenuOpenChange}
          isAdmin={isAdmin}
          isLocalMode={isLocalMode}
          overview={eventOverview.overview}
          primaryIds={menuPrimaryIds}
          onNavigate={(href) => {
            handleMenuOpenChange(false);
            router.push(href);
          }}
        />
      ) : null}

      {isComposeSheetOpen || hasOpenedComposeSheet ? (
        <LazyCanhoesComposeSheet
          open={isComposeSheetOpen}
          onOpenChange={handleComposeSheetChange}
          onDone={() => handleComposeSheetChange(false)}
        />
      ) : null}
    </div>
  );
}
