"use client";

import { useEventOverview } from "@/hooks/useEventOverview";

export type EventRouteModuleKey =
  | "feed"
  | "secretSanta"
  | "wishlist"
  | "categories"
  | "voting"
  | "gala"
  | "stickers"
  | "measures"
  | "nominees"
  | "admin";

const moduleLabelMap: Record<EventRouteModuleKey, string> = {
  feed: "Feed",
  secretSanta: "Secret Santa",
  wishlist: "Wishlist",
  categories: "Categorias",
  voting: "Votacao",
  gala: "Gala",
  stickers: "Stickers",
  measures: "Medidas",
  nominees: "Nomeacoes",
  admin: "Admin",
};

export function useEventModuleAccess(moduleKey: EventRouteModuleKey) {
  const eventOverview = useEventOverview();
  const modules = eventOverview.overview?.modules as Record<string, boolean> | null | undefined;
  const isAdmin = Boolean(eventOverview.overview?.permissions.isAdmin);

  const isAllowed = isAdmin || (moduleKey === "admin" ? Boolean(modules?.admin) : Boolean(modules?.[moduleKey]));

  return {
    ...eventOverview,
    module: { key: moduleKey, label: moduleLabelMap[moduleKey] },
    fallbackHref: "/canhoes",
    fallbackLabel: "Voltar",
    isAllowed,
  };
}
