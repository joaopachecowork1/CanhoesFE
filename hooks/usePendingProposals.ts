"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { CategoryProposalDto, MeasureProposalDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

type UsePendingProposalsReturn = {
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

/**
 * Hook dedicado para carregar propostas pendentes de categorias e medidas.
 * 
 * Usa endpoints dedicados em vez do bootstrap para:
 * - Evitar carregar listas completas no bootstrap inicial
 * - Manter o bootstrap leve (apenas counts + metadata)
 * - Permitir refetch independente das propostas
 */
export function usePendingProposals(eventId: string | null): UsePendingProposalsReturn {
  const queryClient = useQueryClient();

  // Carrega propostas de categorias pendentes
  const categoryQuery = useQuery<CategoryProposalDto[]>({
    enabled: Boolean(eventId),
    queryFn: async () => {
      const page = await canhoesEventsRepo.adminGetCategoryProposals(eventId!, "pending");
      return page.items;
    },
    queryKey: ["canhoes", "admin", "category-proposals", "pending", eventId],
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Carrega propostas de medidas pendentes
  const measureQuery = useQuery<MeasureProposalDto[]>({
    enabled: Boolean(eventId),
    queryFn: async () => {
      const page = await canhoesEventsRepo.adminGetMeasureProposals(eventId!, "pending");
      return page.items;
    },
    queryKey: ["canhoes", "admin", "measure-proposals", "pending", eventId],
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "category-proposals", "pending", eventId] }),
      queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "measure-proposals", "pending", eventId] }),
    ]);
  }, [eventId, queryClient]);

  return {
    categoryProposals: categoryQuery.data ?? [],
    measureProposals: measureQuery.data ?? [],
    loading: categoryQuery.isLoading || measureQuery.isLoading,
    error: categoryQuery.error ?? measureQuery.error ?? null,
    refresh,
  };
}
