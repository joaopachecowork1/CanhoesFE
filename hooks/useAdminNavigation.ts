"use client";

import { useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { toast } from "sonner";

type UseAdminNavigationParams = {
  canAccessAdmin: boolean;
  adminLoading: boolean;
  overviewReady: boolean;
  router: AppRouterInstance;
};

export function useAdminNavigation({
  canAccessAdmin,
  adminLoading,
  overviewReady,
  router,
}: Readonly<UseAdminNavigationParams>) {
  const isReady = canAccessAdmin && !adminLoading;

  const navigateToAdmin = useCallback(() => {
    if (adminLoading) {
      toast.info("A preparar admin...");
      return;
    }

    if (!canAccessAdmin) {
      toast.error("Esta conta nao tem acesso ao admin.");
      return;
    }

    if (!overviewReady) {
      toast.info("A carregar contexto do evento...");
      return;
    }

    router.push("/canhoes/admin/conteudo");
  }, [adminLoading, canAccessAdmin, overviewReady, router]);

  return {
    isReady,
    navigateToAdmin,
  };
}
