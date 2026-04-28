import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { EventSecretSantaOverviewDto, EventWishlistItemDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { normalizeWishlistItems } from "@/lib/api/responseNormalization";

interface SecretSantaData {
  overview: EventSecretSantaOverviewDto;
  wishlistItems: EventWishlistItemDto[];
}

export function useSecretSanta(eventId: string | null | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<SecretSantaData>({
    queryKey: ["secretSanta", eventId],
    enabled: Boolean(eventId),
    queryFn: async () => {
      if (!eventId) throw new Error("Event ID is required");
      
      const [overview, rawWishlistItems] = await Promise.all([
        canhoesEventsRepo.getSecretSantaOverview(eventId),
        canhoesEventsRepo.getWishlist(eventId),
      ]);

      return {
        overview,
        wishlistItems: normalizeWishlistItems(rawWishlistItems),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const drawMutation = useMutation({
    mutationFn: async ({ eventCode }: { eventCode: string | null }) => {
      if (!eventId) throw new Error("Event ID is required");
      await canhoesEventsRepo.adminDrawSecretSanta(eventId, { eventCode });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["secretSanta", eventId] });
    },
  });

  return {
    ...query,
    drawSecretSanta: drawMutation.mutateAsync,
    isDrawing: drawMutation.isPending,
  };
}
