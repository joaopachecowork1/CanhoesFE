"use client";

import { useMemo } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { EventOverviewDto } from "@/lib/api/types";

import type { CanhoesBottomTabEntry } from "./CanhoesBottomTabs";
import {
  BOTTOM_LEFT_NAV_ITEMS,
  getPageTitle,
  getPrimaryRightNavItem,
  isMoreSectionActive,
  MORE_NAV_ITEM,
} from "./canhoesNavigation";

function isHomePath(pathname: string | null) {
  return pathname === "/canhoes" || pathname === "/canhoes/" || pathname === "/canhoes/home";
}

function isTabActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/canhoes") return isHomePath(pathname);
  return pathname.startsWith(href);
}

function resolveUserLabel(user?: {
  email?: string | null;
  name?: string | null;
} | null) {
  const displayName = user?.name?.trim();
  if (displayName) return displayName;
  if (user?.email) return user.email;
  return "Membro";
}

export function useCanhoesShellNavigation({
  isAdmin,
  isLocalMode,
  isMoreSheetOpen,
  onOpenMoreSheet,
  overview,
  pathname,
  router,
  user,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode: boolean;
  isMoreSheetOpen: boolean;
  onOpenMoreSheet: () => void;
  overview?: EventOverviewDto | null;
  pathname: string | null;
  router: AppRouterInstance;
  user?: {
    email?: string | null;
    name?: string | null;
  } | null;
}>) {
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const isEventHomePath = useMemo(() => isHomePath(pathname), [pathname]);
  const userLabel = useMemo(() => resolveUserLabel(user), [user]);

  const primaryRightItem = useMemo(
    () =>
      getPrimaryRightNavItem({
        isAdmin,
        isLocalMode,
        overview,
      }),
    [isAdmin, isLocalMode, overview]
  );

  const isMoreActive = useMemo(
    () =>
      Boolean(pathname) &&
      isMoreSectionActive({
        isAdmin,
        isLocalMode,
        overview,
        pathname: pathname ?? "",
        primaryRightItem,
      }),
    [isAdmin, isLocalMode, overview, pathname, primaryRightItem]
  );

  const bottomLeftEntries = useMemo<readonly [CanhoesBottomTabEntry, CanhoesBottomTabEntry]>(
    () => [
      {
        item: BOTTOM_LEFT_NAV_ITEMS[0],
        isActive: isTabActive(pathname, BOTTOM_LEFT_NAV_ITEMS[0].href),
        onClick: () => router.push(BOTTOM_LEFT_NAV_ITEMS[0].href),
      },
      {
        item: BOTTOM_LEFT_NAV_ITEMS[1],
        isActive: isTabActive(pathname, BOTTOM_LEFT_NAV_ITEMS[1].href),
        onClick: () => router.push(BOTTOM_LEFT_NAV_ITEMS[1].href),
      },
    ],
    [pathname, router]
  );

  const bottomRightEntries = useMemo<readonly [CanhoesBottomTabEntry, CanhoesBottomTabEntry]>(
    () => [
      {
        item: primaryRightItem,
        isActive: isTabActive(pathname, primaryRightItem.href),
        onClick: () => router.push(primaryRightItem.href),
      },
      {
        item: MORE_NAV_ITEM,
        isActive: isMoreSheetOpen || isMoreActive,
        onClick: onOpenMoreSheet,
      },
    ],
    [isMoreActive, isMoreSheetOpen, onOpenMoreSheet, pathname, primaryRightItem, router]
  );

  const moreSheetPrimaryIds = useMemo(
    () => [
      ...BOTTOM_LEFT_NAV_ITEMS.map((item) => item.id),
      primaryRightItem.id,
      MORE_NAV_ITEM.id,
    ],
    [primaryRightItem.id]
  );

  return {
    bottomLeftEntries,
    bottomRightEntries,
    isEventHomePath,
    isMoreActive,
    pageTitle,
    primaryRightItem,
    userLabel,
    moreSheetPrimaryIds,
  };
}
