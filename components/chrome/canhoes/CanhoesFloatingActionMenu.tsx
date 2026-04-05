"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";

import type { EventOverviewDto } from "@/lib/api/types";
import { adminCopy } from "@/lib/canhoesCopy";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import {
    getVisibleMoreAdminItem,
    getVisibleMoreNavItems,
    type CanhoesNavItem,
} from "./canhoesNavigation";
import { useDismissOnEscape } from "./useDismissOnEscape";

const DRAG_DISMISS_THRESHOLD = 110;
const DRAG_DISMISS_VELOCITY = 700;

type CanhoesFloatingActionMenuProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isAdmin: boolean;
    isLocalMode: boolean;
    overview?: EventOverviewDto | null;
    primaryIds: readonly string[];
    onNavigate: (href: string) => void;
};

export function CanhoesFloatingActionMenu({
    isOpen,
    onOpenChange,
    isAdmin,
    isLocalMode,
    overview,
    primaryIds,
    onNavigate,
}: Readonly<CanhoesFloatingActionMenuProps>) {
    const pathname = usePathname();
    const shortcuts = getVisibleMoreNavItems({
        excludedIds: [...primaryIds],
        isAdmin,
        isLocalMode,
        overview,
    });

    const adminShortcut = getVisibleMoreAdminItem({
        excludedIds: [...primaryIds],
        isAdmin,
        isLocalMode,
        overview,
    });

    useDismissOnEscape(isOpen, () => onOpenChange(false));

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > DRAG_DISMISS_THRESHOLD || info.velocity.y > DRAG_DISMISS_VELOCITY) {
      onOpenChange(false);
    }
  };

  return (
    <AnimatePresence>
            {isOpen ? (
                <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-[rgba(5,8,4,0.54)] backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeOut" }}
                    />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] pt-24 sm:px-6 sm:pb-8">
            <motion.section
              initial={{ opacity: 0, x: 8, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, y: 16, scale: 0.98 }}
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.18 }}
              onDragEnd={handleDragEnd}
              transition={{
                duration: 0.28,
                type: "spring",
                stiffness: 340,
                damping: 28,
                delay: 0.04,
              }}
              className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-end gap-3 touch-pan-y"
            >
              <div className="flex w-full justify-center px-8 pb-1 sm:hidden">
                <span className="h-1.5 w-12 rounded-full bg-[rgba(245,237,224,0.28)]" />
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex min-h-10 items-center rounded-full border border-[rgba(177,140,255,0.18)] bg-[linear-gradient(180deg,rgba(18,22,11,0.9),rgba(11,14,8,0.94))] px-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel),var(--glow-purple-sm)]">
                                    <div className="min-w-0">
                                        <p className="label text-[rgba(245,237,224,0.7)]">
                                            {adminCopy.shell.more.kicker}
                                        </p>
                                        <p className="text-sm font-semibold">{adminCopy.shell.more.title}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-12 w-12 shrink-0 rounded-full border border-[rgba(212,184,150,0.12)] bg-[rgba(28,34,18,0.88)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)] hover:bg-[rgba(38,48,24,0.96)]"
                                    onClick={() => onOpenChange(false)}
                                    aria-label="Fechar menu"
                                >
                                    <motion.span
                                        animate={{ rotate: 45 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20,
                                        }}
                                        className="inline-flex"
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.span>
                                </Button>
                            </div>

              <div className="scrollbar-none overscroll-y-contain flex max-h-[min(30rem,calc(100svh-12.5rem-env(safe-area-inset-bottom,0px)))] w-full flex-col gap-2 overflow-y-auto pr-1">
                                {adminShortcut ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, delay: 0.04 }}
                                    >
                                        <AdminShortcutCard
                                            isActive={Boolean(pathname?.startsWith(adminShortcut.href))}
                                            item={adminShortcut}
                                            onClick={() => onNavigate(adminShortcut.href)}
                                        />
                                    </motion.div>
                                ) : null}

                                {shortcuts.length > 0 ? (
                                    <div className="flex w-full flex-col gap-2">
                                        {shortcuts.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                            >
                                                <FloatingMenuLink
                                                    item={item}
                                                    isActive={Boolean(pathname?.startsWith(item.href))}
                                                    onClick={() => onNavigate(item.href)}
                                                    style={{ transitionDelay: `${index * 28}ms` }}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                        <div className="w-full rounded-[1.4rem] border border-[rgba(212,184,150,0.16)] bg-[rgba(12,16,8,0.8)] px-4 py-3 text-sm text-[rgba(245,237,224,0.9)] shadow-[var(--shadow-panel)]">
                    {adminCopy.shell.more.empty}
                  </div>
                )}
                            </div>
                        </motion.section>
                    </div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}

function FloatingMenuLink({
    item,
    isActive,
    onClick,
    style,
}: Readonly<{
    item: CanhoesNavItem;
    isActive: boolean;
    onClick: () => void;
    style?: CSSProperties;
}>) {
    const Icon = item.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            style={style}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                "canhoes-tap flex w-full items-center gap-3 rounded-[1.45rem] border px-3.5 py-3 text-left shadow-[var(--shadow-panel)] transition-[transform,border-color,background-color,box-shadow] hover:[box-shadow:var(--shadow-panel),var(--glow-purple-sm)] active:scale-[0.99]",
                isActive
                    ? "border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(30,24,44,0.98),rgba(16,12,26,0.98))] text-[var(--bg-paper)]"
                    : "border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,8,0.72)] text-[var(--bg-paper)]"
            )}
        >
            <span
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                    isActive
                        ? "border-[rgba(0,255,136,0.22)] bg-[rgba(47,63,27,0.92)] text-[var(--neon-green)] [box-shadow:var(--glow-green-sm)]"
                        : "border-[rgba(177,140,255,0.28)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]"
                )}
            >
                <Icon className="h-4 w-4" />
            </span>

            <span className="min-w-0 flex-1">
                <span className="block font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                    {item.label}
                </span>
                {item.description ? (
            <span className="mt-1 block text-[13px] leading-5 text-[rgba(245,237,224,0.88)]">
              {item.description}
            </span>
        ) : null}
            </span>

            <ArrowRight className="h-4 w-4 shrink-0 text-[rgba(245,237,224,0.84)]" />
        </button>
    );
}

function AdminShortcutCard({
    isActive,
    item,
    onClick,
}: Readonly<{
    isActive: boolean;
    item: CanhoesNavItem;
    onClick: () => void;
}>) {
    const Icon = item.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                "canhoes-tap flex w-full items-center gap-3 rounded-[1.45rem] border px-3.5 py-3.5 text-left shadow-[var(--glow-green-sm)] transition-[transform,border-color,background-color,box-shadow] hover:[box-shadow:var(--glow-green-sm),var(--glow-purple-sm)] active:scale-[0.99]",
                isActive
                    ? "border-[rgba(0,255,136,0.34)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.22),transparent_34%),linear-gradient(180deg,rgba(38,55,25,1),rgba(18,25,11,1))]"
                    : "border-[rgba(0,255,136,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.18),transparent_34%),linear-gradient(180deg,rgba(34,48,22,0.98),rgba(16,23,10,0.98))]"
            )}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(177,140,255,0.3)] bg-[linear-gradient(180deg,rgba(54,43,74,0.96),rgba(28,21,42,0.98))] text-[var(--accent-purple-soft)] [box-shadow:var(--glow-purple-sm)]">
                <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--neon-green)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {adminCopy.shell.more.admin}
                </span>
                <span className="block text-[13px] font-semibold text-[var(--bg-paper)]">
                    {adminCopy.shell.more.adminTitle}
                </span>
        <span className="block text-[13px] leading-5 text-[rgba(245,237,224,0.88)]">
          {adminCopy.shell.more.adminDescription}
        </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--neon-green)]" />
        </button>
    );
}
