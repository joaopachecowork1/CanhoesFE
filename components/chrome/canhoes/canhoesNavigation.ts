"use client";

import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Gift,
  Medal,
  Ruler,
  ScrollText,
  Shield,
  Sticker,
  Trophy,
} from "lucide-react";

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

export const BOTTOM_NAV_ITEMS: readonly CanhoesNavItem[] = [
  {
    href: "/canhoes",
    icon: ScrollText,
    id: "feed",
    label: "Feed",
  },
  {
    href: "/canhoes/categorias",
    icon: Trophy,
    id: "ranking",
    label: "Ranking",
  },
  {
    href: "/canhoes/votacao",
    icon: Flame,
    id: "voting",
    label: "Votacao",
  },
] as const;

export const MORE_NAV_ITEMS: readonly CanhoesNavItem[] = [
  {
    description: "Submete e revê stickers aprovados.",
    href: "/canhoes/stickers",
    icon: Sticker,
    id: "stickers",
    label: "Stickers",
  },
  {
    description: "Consulta e gere a wishlist do grupo.",
    href: "/canhoes/wishlist",
    icon: Gift,
    id: "wishlist",
    label: "Wishlist",
  },
  {
    description: "Vê o emparelhamento e a wishlist do teu amigo secreto.",
    href: "/canhoes/amigo-secreto",
    icon: Gift,
    id: "secret-santa",
    label: "Amigo secreto",
  },
  {
    description: "Area final do evento. Fica oculta em modo local.",
    hideInLocalMode: true,
    href: "/canhoes/gala",
    icon: Medal,
    id: "gala",
    label: "Gala",
  },
  {
    description: "Regras e castigos aprovados para a reta final.",
    href: "/canhoes/medidas",
    icon: Ruler,
    id: "measures",
    label: "Medidas",
  },
  {
    description: "Arquivo completo de nomeacoes aprovadas.",
    href: "/canhoes/nomeacoes",
    icon: ScrollText,
    id: "nominees",
    label: "Nomeacoes",
  },
  {
    description: "Moderacao, votacoes e estado do evento.",
    href: "/canhoes/admin",
    icon: Shield,
    id: "admin",
    label: "Admin",
    requiresAdmin: true,
  },
] as const;

const PAGE_TITLES: readonly Pick<CanhoesNavItem, "href" | "label">[] = [
  ...BOTTOM_NAV_ITEMS,
  ...MORE_NAV_ITEMS,
];

export function getPageTitle(pathname: string | null) {
  if (!pathname) return "Feed";

  const matchedPage = PAGE_TITLES.find(({ href }) => pathname.startsWith(href));
  return matchedPage?.label ?? "Feed";
}

export function isTabActive(pathname: string, href: string) {
  if (href === "/canhoes") {
    return (
      pathname === "/canhoes" ||
      pathname === "/canhoes/" ||
      pathname === "/canhoes/feed"
    );
  }

  return pathname.startsWith(href);
}

export function getVisibleMoreNavItems({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
}>) {
  return MORE_NAV_ITEMS.filter((item) => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.hideInLocalMode && isLocalMode) return false;
    return true;
  });
}

export function isMoreSectionActive({
  isAdmin,
  isLocalMode = IS_LOCAL_MODE,
  pathname,
}: Readonly<{
  isAdmin: boolean;
  isLocalMode?: boolean;
  pathname: string;
}>) {
  return getVisibleMoreNavItems({ isAdmin, isLocalMode }).some(({ href }) =>
    pathname.startsWith(href)
  );
}
