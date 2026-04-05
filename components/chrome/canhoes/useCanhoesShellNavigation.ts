"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { EventOverviewDto } from "@/lib/api/types";

import type { CanhoesBottomTabEntry } from "./CanhoesBottomTabs";
import {
  ADMIN_NAV_ITEM,
  getPromotedNavItems,
  getPageTitle,
  HOME_NAV_ITEM,
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
  isMenuOpen,
  onOpenMenu,
  overview,
  pathname,
  router,
  user,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode: boolean;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  overview?: EventOverviewDto | null;
  pathname: string | null;
  router: AppRouterInstance;
  user?: {
    email?: string | null;
    name?: string | null;
  } | null;
}>) {
  const pageTitle = getPageTitle(pathname);
  const isEventHomePath = isHomePath(pathname);
  const userLabel = resolveUserLabel(user);

  const promotedItems = getPromotedNavItems({
    isAdmin,
    isLocalMode,
    overview,
  });

  const fixedRightItem = isAdmin ? ADMIN_NAV_ITEM : MORE_NAV_ITEM;

  const isMoreActive =
    fixedRightItem.id === MORE_NAV_ITEM.id &&
    Boolean(pathname) &&
    isMoreSectionActive({
      isAdmin,
      isLocalMode,
      overview,
      pathname: pathname ?? "",
      promotedItems,
    });

  const bottomLeftEntries: readonly CanhoesBottomTabEntry[] = [
    {
      item: HOME_NAV_ITEM,
      isActive: isTabActive(pathname, HOME_NAV_ITEM.href),
      onClick: () => router.push(HOME_NAV_ITEM.href),
    },
    ...(promotedItems[0]
      ? [
          {
            item: promotedItems[0],
            isActive: isTabActive(pathname, promotedItems[0].href),
            onClick: () => router.push(promotedItems[0].href),
          },
        ]
      : []),
  ];

  const bottomRightEntries: readonly CanhoesBottomTabEntry[] = [
    ...(promotedItems[1]
      ? [
          {
            item: promotedItems[1],
            isActive: isTabActive(pathname, promotedItems[1].href),
            onClick: () => router.push(promotedItems[1].href),
          },
        ]
      : []),
    {
      item: fixedRightItem,
      isActive:
        fixedRightItem.id === MORE_NAV_ITEM.id
          ? isMenuOpen || isMoreActive
          : isTabActive(pathname, fixedRightItem.href),
      onClick:
        fixedRightItem.id === MORE_NAV_ITEM.id
          ? onOpenMenu
          : () => router.push(fixedRightItem.href),
    },
  ];

  const menuPrimaryIds = [
    HOME_NAV_ITEM.id,
    ...promotedItems.map((item) => item.id),
    fixedRightItem.id,
  ];

  return {
    bottomLeftEntries,
    bottomRightEntries,
    isEventHomePath,
    isMoreActive,
    pageTitle,
    promotedItems,
    userLabel,
    menuPrimaryIds,
  };
}
