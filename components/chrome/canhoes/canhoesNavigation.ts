"use client";

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Gift,
  House,
  Medal,
  Menu,
  Ruler,
  ScrollText,
  Shield,
  Sticker,
  Trophy,
} from "lucide-react";

import type { EventModulesDto, EventOverviewDto } from "@/lib/api/types";
import {
  CANHOES_MEMBER_MODULE_MAP,
  CANHOES_MEMBER_NAV_ORDER,
  type CanhoesMemberModuleKey,
} from "@/lib/modules";
import { IS_LOCAL_MODE } from "@/lib/mock";

export type CanhoesNavItem = {
  description?: string;
  hideInLocalMode?: boolean;
  href: string;
  icon: LucideIcon;
  id: string;
  label: string;
  requiresAdmin?: boolean;
};

export type CanhoesPageTone = "admin" | "event" | "official" | "social";

export type CanhoesPageContext = {
  description?: string;
  shortLabel: string;
  title: string;
  tone: CanhoesPageTone;
  toneLabel: string;
};

export const HOME_NAV_ITEM: CanhoesNavItem = {
  href: "/canhoes",
  icon: House,
  id: "home",
  label: "Evento",
};

const MODULE_ITEM_ID_BY_KEY: Record<CanhoesMemberModuleKey, string> = {
  feed: "feed",
  secretSanta: "secret-santa",
  wishlist: "wishlist",
  categories: "categories",
  voting: "voting",
  gala: "gala",
  stickers: "stickers",
  measures: "measures",
  nominees: "nominees",
};

const MODULE_KEY_BY_ITEM_ID = Object.fromEntries(
  Object.entries(MODULE_ITEM_ID_BY_KEY).map(([moduleKey, itemId]) => [itemId, moduleKey])
) as Partial<Record<string, keyof EventModulesDto>>;

const MODULE_NAV_ITEMS: Record<CanhoesMemberModuleKey, CanhoesNavItem> = {
  feed: {
    description: CANHOES_MEMBER_MODULE_MAP.feed.description,
    href: CANHOES_MEMBER_MODULE_MAP.feed.href,
    icon: ScrollText,
    id: MODULE_ITEM_ID_BY_KEY.feed,
    label: CANHOES_MEMBER_MODULE_MAP.feed.navLabel ?? CANHOES_MEMBER_MODULE_MAP.feed.label,
  },
  secretSanta: {
    description: CANHOES_MEMBER_MODULE_MAP.secretSanta.description,
    href: CANHOES_MEMBER_MODULE_MAP.secretSanta.href,
    icon: Gift,
    id: MODULE_ITEM_ID_BY_KEY.secretSanta,
    label:
      CANHOES_MEMBER_MODULE_MAP.secretSanta.navLabel ??
      CANHOES_MEMBER_MODULE_MAP.secretSanta.label,
  },
  wishlist: {
    description: CANHOES_MEMBER_MODULE_MAP.wishlist.description,
    href: CANHOES_MEMBER_MODULE_MAP.wishlist.href,
    icon: Gift,
    id: MODULE_ITEM_ID_BY_KEY.wishlist,
    label:
      CANHOES_MEMBER_MODULE_MAP.wishlist.navLabel ?? CANHOES_MEMBER_MODULE_MAP.wishlist.label,
  },
  categories: {
    description: CANHOES_MEMBER_MODULE_MAP.categories.description,
    href: CANHOES_MEMBER_MODULE_MAP.categories.href,
    icon: Trophy,
    id: MODULE_ITEM_ID_BY_KEY.categories,
    label:
      CANHOES_MEMBER_MODULE_MAP.categories.navLabel ??
      CANHOES_MEMBER_MODULE_MAP.categories.label,
  },
  voting: {
    description: CANHOES_MEMBER_MODULE_MAP.voting.description,
    href: CANHOES_MEMBER_MODULE_MAP.voting.href,
    icon: Flame,
    id: MODULE_ITEM_ID_BY_KEY.voting,
    label: CANHOES_MEMBER_MODULE_MAP.voting.navLabel ?? CANHOES_MEMBER_MODULE_MAP.voting.label,
  },
  gala: {
    description: CANHOES_MEMBER_MODULE_MAP.gala.description,
    hideInLocalMode: true,
    href: CANHOES_MEMBER_MODULE_MAP.gala.href,
    icon: Medal,
    id: MODULE_ITEM_ID_BY_KEY.gala,
    label: CANHOES_MEMBER_MODULE_MAP.gala.navLabel ?? CANHOES_MEMBER_MODULE_MAP.gala.label,
  },
  stickers: {
    description: CANHOES_MEMBER_MODULE_MAP.stickers.description,
    href: CANHOES_MEMBER_MODULE_MAP.stickers.href,
    icon: Sticker,
    id: MODULE_ITEM_ID_BY_KEY.stickers,
    label:
      CANHOES_MEMBER_MODULE_MAP.stickers.navLabel ?? CANHOES_MEMBER_MODULE_MAP.stickers.label,
  },
  measures: {
    description: CANHOES_MEMBER_MODULE_MAP.measures.description,
    href: CANHOES_MEMBER_MODULE_MAP.measures.href,
    icon: Ruler,
    id: MODULE_ITEM_ID_BY_KEY.measures,
    label:
      CANHOES_MEMBER_MODULE_MAP.measures.navLabel ?? CANHOES_MEMBER_MODULE_MAP.measures.label,
  },
  nominees: {
    description: CANHOES_MEMBER_MODULE_MAP.nominees.description,
    href: CANHOES_MEMBER_MODULE_MAP.nominees.href,
    icon: ScrollText,
    id: MODULE_ITEM_ID_BY_KEY.nominees,
    label:
      CANHOES_MEMBER_MODULE_MAP.nominees.navLabel ?? CANHOES_MEMBER_MODULE_MAP.nominees.label,
  },
};

export const ADMIN_NAV_ITEM: CanhoesNavItem = {
  description: "Painel operacional com fila, fases, visibilidade e resultados oficiais.",
  href: "/canhoes/admin",
  icon: Shield,
  id: "admin",
  label: "Admin",
  requiresAdmin: true,
};

export const MORE_NAV_ITEM: CanhoesNavItem = {
  description: "Atalhos para areas sociais e oficiais que ficam fora do dock principal.",
  href: "/canhoes/menu",
  icon: Menu,
  id: "more",
  label: "Mais",
};

const ORDERED_MEMBER_NAV_ITEMS = CANHOES_MEMBER_NAV_ORDER.map(
  (moduleKey) => MODULE_NAV_ITEMS[moduleKey]
);

const STATIC_PAGE_TITLES: readonly Pick<CanhoesNavItem, "href" | "label">[] = [
  HOME_NAV_ITEM,
  ...ORDERED_MEMBER_NAV_ITEMS,
  ADMIN_NAV_ITEM,
];

function resolvePageContextFromItem(item: CanhoesNavItem): CanhoesPageContext {
  switch (item.id) {
    case "feed":
      return {
        description: item.description,
        shortLabel: item.label,
        title: "Mural social",
        tone: "social",
        toneLabel: "Social",
      };
    case "voting":
      return {
        description: item.description,
        shortLabel: item.label,
        title: "Boletim oficial",
        tone: "official",
        toneLabel: "Oficial",
      };
    case "nominees":
      return {
        description: item.description,
        shortLabel: item.label,
        title: "Nomeacoes oficiais",
        tone: "official",
        toneLabel: "Oficial",
      };
    case "categories":
      return {
        description: item.description,
        shortLabel: item.label,
        title: "Categorias oficiais",
        tone: "official",
        toneLabel: "Oficial",
      };
    case "admin":
      return {
        description: item.description,
        shortLabel: item.label,
        title: "Admin operacional",
        tone: "admin",
        toneLabel: "Admin",
      };
    default:
      return {
        description: item.description,
        shortLabel: item.label,
        title: item.label,
        tone: "event",
        toneLabel: "Evento",
      };
  }
}

export function getPageContext(pathname: string | null): CanhoesPageContext {
  if (!pathname) {
    return {
      description: "Resumo da fase e acesso rapido as areas abertas desta edicao.",
      shortLabel: HOME_NAV_ITEM.label,
      title: "Evento",
      tone: "event",
      toneLabel: "Evento",
    };
  }

  const matchedStaticPage = STATIC_PAGE_TITLES.find(({ href }) => pathname.startsWith(href));
  if (matchedStaticPage) {
    const navItem = [HOME_NAV_ITEM, ...ORDERED_MEMBER_NAV_ITEMS, ADMIN_NAV_ITEM].find(
      (item) => item.href === matchedStaticPage.href
    );
    if (navItem) {
      return resolvePageContextFromItem(navItem);
    }
  }

  return {
    description: "Resumo da fase e acesso rapido as areas abertas desta edicao.",
    shortLabel: HOME_NAV_ITEM.label,
    title: "Evento",
    tone: "event",
    toneLabel: "Evento",
  };
}

function isNavItemAvailable({
  itemId,
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  itemId: string;
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  if (itemId === HOME_NAV_ITEM.id || itemId === MORE_NAV_ITEM.id) return true;
  if (itemId === ADMIN_NAV_ITEM.id) return isAdmin;
  if (itemId === MODULE_ITEM_ID_BY_KEY.gala && isLocalMode) return false;

  const modules = overview?.modules;
  if (!modules) return false;

  const moduleKey = MODULE_KEY_BY_ITEM_ID[itemId as keyof typeof MODULE_KEY_BY_ITEM_ID];
  if (!moduleKey || !modules[moduleKey]) return false;

  if (isAdmin) return true;

  const activePhaseType = overview?.activePhase?.type;
  if (moduleKey === "nominees") return activePhaseType === "PROPOSALS";
  if (moduleKey === "voting") return activePhaseType === "VOTING";

  return true;
}

export function getPromotedNavItems({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  return ORDERED_MEMBER_NAV_ITEMS.filter((item) =>
    isNavItemAvailable({
      itemId: item.id,
      isAdmin,
      isLocalMode,
      overview,
    })
  ).slice(0, 2);
}

export function getPageTitle(pathname: string | null) {
  return getPageContext(pathname).shortLabel;
}

export function getVisibleMoreNavItems({
  excludedIds = [],
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  excludedIds?: string[];
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  return ORDERED_MEMBER_NAV_ITEMS.filter((item) => {
    if (excludedIds.includes(item.id)) return false;

    return isNavItemAvailable({
      itemId: item.id,
      isAdmin,
      isLocalMode,
      overview,
    });
  });
}

export function getVisibleMoreAdminItem({
  excludedIds = [],
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
}: Readonly<{
  excludedIds?: string[];
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
}>) {
  if (excludedIds.includes(ADMIN_NAV_ITEM.id)) return null;
  if (
    !isNavItemAvailable({
      itemId: ADMIN_NAV_ITEM.id,
      isAdmin,
      isLocalMode,
      overview,
    })
  ) {
    return null;
  }

  return ADMIN_NAV_ITEM;
}

export function isMoreSectionActive({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  overview,
  pathname,
  promotedItems,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
  overview?: EventOverviewDto | null;
  pathname: string;
  promotedItems: readonly CanhoesNavItem[];
}>) {
  const primaryIds = [
    HOME_NAV_ITEM.id,
    ...promotedItems.map((item) => item.id),
    MORE_NAV_ITEM.id,
  ];

  return getVisibleMoreNavItems({
    excludedIds: primaryIds,
    isAdmin,
    isLocalMode,
    overview,
  }).some(({ href }) => pathname.startsWith(href));
}
