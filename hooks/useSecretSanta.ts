"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventRepo } from "@/lib/repositories/eventRepo";
import { adminRepo } from "@/lib/repositories/adminRepo";

export function useSecretSanta(eventId?: string) {
  const queryClient = useQueryClient();

  const { data: overview, isLoading, error, refetch } = useQuery({
    queryKey: ["secretSantaOverview", eventId],
    queryFn: () => eventRepo.getSecretSantaOverview(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: wishlistData } = useQuery({
    queryKey: ["wishlist", eventId, 0, 1000],
    queryFn: () => eventRepo.getWishlist(eventId!, 0, 1000),
    enabled: !!eventId && !!overview?.hasAssignment,
  });

  const drawMutation = useMutation({
    mutationFn: (payload: { eventCode: string | null }) => 
      adminRepo.drawSecretSanta(eventId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["secretSantaOverview", eventId] });
      void queryClient.invalidateQueries({ queryKey: ["eventOverview", eventId] });
    }
  });

  return {
    data: overview ? { overview, wishlistItems: wishlistData?.items ?? [] } : null,
    overview: overview ?? null,
    isLoading: isLoading,
    error,
    refetch,
    drawSecretSanta: drawMutation.mutateAsync,
    isDrawing: drawMutation.isPending,
  };
}
