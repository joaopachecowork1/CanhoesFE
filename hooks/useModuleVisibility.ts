"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminRepo } from "@/lib/repositories/adminRepo";
import { toast } from "sonner";
import type { AdminModuleKey } from "@/lib/api/types";

export type ModuleVisibilityItem = {
  key: AdminModuleKey;
  label: string;
  isEnabled: boolean;
};

export function useModuleVisibility(eventId: string) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleModule = useCallback(
    async (moduleKey: string, currentValue: boolean) => {
      setIsUpdating(true);
      try {
        const patch = { [moduleKey]: !currentValue };
        await adminRepo.updateModules(eventId, patch);
        
        await queryClient.invalidateQueries({ queryKey: ["adminBootstrap", eventId] });
        
        toast.success(`Módulo ${moduleKey} ${!currentValue ? "ativado" : "desativado"}.`);
      } catch (error) {
        toast.error("Erro ao atualizar visibilidade do módulo.");
        console.error(error);
      } finally {
        setIsUpdating(false);
      }
    },
    [eventId, queryClient]
  );

  return {
    toggleModule,
    isUpdating,
  };
}
