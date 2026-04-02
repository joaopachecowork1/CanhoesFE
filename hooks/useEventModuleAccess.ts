"use client";

import { useEventOverview } from "@/hooks/useEventOverview";
import {
  CANHOES_MEMBER_MODULE_MAP,
  CANHOES_MEMBER_NAV_ORDER,
  type CanhoesMemberModuleDefinition,
  type CanhoesMemberModuleKey,
} from "@/lib/modules";

export type EventRouteModuleKey = CanhoesMemberModuleKey | "admin";

type EventRouteModuleDefinition = Omit<CanhoesMemberModuleDefinition, "key"> & {
  key: EventRouteModuleKey;
};

const ADMIN_MODULE_DEFINITION: EventRouteModuleDefinition = {
  key: "admin",
  label: "Admin",
  navLabel: "Admin",
  href: "/canhoes/admin",
  group: "core",
  description: "Centro de controlo, fases, pendentes e configuracao da edicao.",
};

function getModuleDefinition(moduleKey: EventRouteModuleKey): EventRouteModuleDefinition {
  if (moduleKey === "admin") {
    return ADMIN_MODULE_DEFINITION;
  }

  return CANHOES_MEMBER_MODULE_MAP[moduleKey];
}

function getFallbackRoute(
  moduleKey: EventRouteModuleKey,
  isAdmin: boolean,
  modules?: Record<string, boolean> | null
) {
  for (const candidateKey of CANHOES_MEMBER_NAV_ORDER) {
    if (candidateKey === moduleKey) continue;
    if (!modules?.[candidateKey]) continue;

    return {
      href: CANHOES_MEMBER_MODULE_MAP[candidateKey].href,
      label: CANHOES_MEMBER_MODULE_MAP[candidateKey].label,
    };
  }

  if (isAdmin && moduleKey !== "admin") {
    return {
      href: ADMIN_MODULE_DEFINITION.href,
      label: ADMIN_MODULE_DEFINITION.label,
    };
  }

  return {
    href: "/canhoes",
    label: "Evento",
  };
}

export function useEventModuleAccess(moduleKey: EventRouteModuleKey) {
  const eventOverview = useEventOverview();
  const definition = getModuleDefinition(moduleKey);
  const modules = eventOverview.overview?.modules as Record<string, boolean> | null | undefined;
  const isAllowed =
    moduleKey === "admin"
      ? Boolean(modules?.admin ?? eventOverview.overview?.permissions.isAdmin)
      : Boolean(modules?.[moduleKey]);
  const fallback = getFallbackRoute(
    moduleKey,
    Boolean(eventOverview.overview?.permissions.isAdmin),
    modules
  );

  return {
    ...eventOverview,
    fallbackHref: fallback.href,
    fallbackLabel: fallback.label,
    isAllowed,
    module: definition,
  };
}
