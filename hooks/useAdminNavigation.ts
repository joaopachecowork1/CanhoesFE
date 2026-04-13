"use client";

import { useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { toast } from "sonner";

type UseAdminNavigationParams = {
  adminLoading: boolean;
  overviewReady: boolean;
  router: AppRouterInstance;
};

export function useAdminNavigation({
  adminLoading,
  overviewReady,
  router,
}: Readonly<UseAdminNavigationParams>) {
  const isReady = overviewReady && !adminLoading;

  const navigateToAdmin = useCallback(() => {
    if (!isReady) {
      toast.info("A preparar admin...");
      return;
    }

    router.push("/canhoes/admin/conteudo");
  }, [isReady, router]);

  return {
    isReady,
    navigateToAdmin,
  };
}
