"use client";

import { useCallback, useRef, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  type AdminSectionId,
  getAdminAdjacentSection,
  getAdminSectionMeta,
} from "../adminSections";

const AdminRouteTabs = lazy(() => import("./AdminRouteTabs").then((m) => ({ default: m.AdminRouteTabs })));

type AdminSectionShellProps = {
  activeId: AdminSectionId;
  children: ReactNode;
};

export function AdminSectionShell({
  activeId,
  children,
}: Readonly<AdminSectionShellProps>) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const sectionMeta = getAdminSectionMeta();
  const activeMeta = sectionMeta.find((section) => section.id === activeId) ?? null;

  const navigateTo = useCallback(
    (target: AdminSectionId | null) => {
      if (!target || target === activeId) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(12);
      }
      router.push(`/canhoes/admin/${target}`);
    },
    [activeId, router]
  );

  const previousSection = getAdminAdjacentSection(activeId, "prev");
  const nextSection = getAdminAdjacentSection(activeId, "next");

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const firstTouch = event.touches[0];
    if (!firstTouch) return;
    touchStartX.current = firstTouch.clientX;
    touchStartY.current = firstTouch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      const firstTouch = event.changedTouches[0];
      const startX = touchStartX.current;
      const startY = touchStartY.current;

      touchStartX.current = null;
      touchStartY.current = null;

      if (!firstTouch || startX === null || startY === null) return;

      const deltaX = firstTouch.clientX - startX;
      const deltaY = firstTouch.clientY - startY;

      // Ignore near-vertical gestures so list scrolling remains natural.
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < 58) return;

      if (deltaX < 0) {
        navigateTo(nextSection);
      } else {
        navigateTo(previousSection);
      }
    },
    [navigateTo, nextSection, previousSection]
  );

  return (
    <div className="space-y-3">
      <Suspense fallback={<div className="h-8 w-full animate-pulse rounded-lg bg-[rgba(212,184,150,0.06)]" />}>
        <AdminRouteTabs activeId={activeId} />
      </Suspense>

      <div className="sm:hidden rounded-xl border border-[rgba(212,184,150,0.14)] bg-[rgba(16,20,11,0.72)] px-2 py-1.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() => navigateTo(previousSection)}
            disabled={!previousSection}
            aria-label="Secao anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <p className="min-w-0 flex-1 truncate text-center font-[var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[rgba(245,237,224,0.92)]">
            {activeMeta?.label ?? "Admin"}
          </p>

          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
            onClick={() => navigateTo(nextSection)}
            disabled={!nextSection}
            aria-label="Proxima secao"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {children}
      </div>
    </div>
  );
}
