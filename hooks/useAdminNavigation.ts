"use client";

import { useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { toast } from "sonner";

type UseAdminNavigationParams = {
  canAccessAdmin: boolean;
  adminLoading: boolean;
  router: AppRouterInstance;
};

export function useAdminNavigation({
  canAccessAdmin,
  adminLoading,
  router,
}: Readonly<UseAdminNavigationParams>) {
  const navigateToAdmin = useCallback(() => {
    if (adminLoading) {
      toast.info("A preparar admin...");
      return;
    }

    if (!canAccessAdmin) {
      toast.error("Esta conta nao tem acesso ao admin.");
      return;
    }

    router.push("/canhoes/admin/conteudo");
  }, [adminLoading, canAccessAdmin, router]);

  return {
    navigateToAdmin,
  };
}
