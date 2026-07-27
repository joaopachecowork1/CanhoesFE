"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminRepo } from "@/lib/repositories/adminRepo";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import type { AdminModuleKey } from "@/lib/api/types";

export type ModuleVisibilityItem = {
  key: AdminModuleKey;
  label: string;
  isEnabled: boolean;
};

export function useModuleVisibility(eventId: string | null) {
  const queryClient = useQueryClient();
  const [updatingKey, setUpdatingKey] = useState<AdminModuleKey | null>(null);

  const toggleModule = useCallback(
    async (moduleKey: AdminModuleKey, enabled: boolean) => {
      if (!eventId || updatingKey) return false;

      setUpdatingKey(moduleKey);
      try {
        const patch = { [moduleKey]: enabled };
        await adminRepo.updateModules(eventId, patch);
        await queryClient.invalidateQueries({ queryKey: ["adminBootstrap", eventId] });

        toast.success(`Módulo ${moduleKey} ${enabled ? "ativado" : "ocultado"}.`);
        return true;
      } catch (error) {
        toast.error("Erro ao atualizar visibilidade do módulo.");
        logger.error("Erro ao atualizar visibilidade do módulo.", error);
        return false;
      } finally {
        setUpdatingKey(null);
      }
    },
    [eventId, queryClient, updatingKey]
  );

  return {
    toggleModule,
    updatingKey,
  };
}
