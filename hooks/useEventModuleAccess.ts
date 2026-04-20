"use client";

import { useEventOverview } from "@/hooks/useEventOverview";

export function useEventModuleAccess(moduleKey: string) {
  const eventOverview = useEventOverview();
  const modules = eventOverview.overview?.modules as Record<string, boolean> | null | undefined;
  const isAdmin = Boolean(eventOverview.overview?.permissions.isAdmin);

  const isAllowed = moduleKey === "admin" ? Boolean(modules?.admin ?? isAdmin) : isAdmin || Boolean(modules?.[moduleKey]);

  return {
    ...eventOverview,
    isAllowed,
  };
}
