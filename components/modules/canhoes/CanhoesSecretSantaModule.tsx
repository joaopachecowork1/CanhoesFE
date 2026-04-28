"use client";

import { useState, useEffect } from "react";
import { Gift, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { CANHOES_MEMBER_MODULE_MAP } from "@/lib/modules";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { AssignedWishlistPanel } from "./secret-santa/AssignedWishlistPanel";
import { SecretSantaContent } from "./secret-santa/SecretSantaContent";
import { WishlistPreviewCard } from "./secret-santa/WishlistPreviewCard";

function buildDefaultEventCode(eventId?: string | null) {
  if (eventId) return eventId;
  return `canhoes${new Date().getFullYear()}`;
}

export function CanhoesSecretSantaModule() {
  const { user } = useAuth();
  const { event, overview, refresh: refreshOverview, isLoading: isOverviewLoading } = useEventOverview();
  
  const isAdmin = Boolean(user?.isAdmin) || Boolean(overview?.permissions.isAdmin);
  const eventId = event?.id;

  const { data, isLoading, error, refetch, drawSecretSanta, isDrawing } = useSecretSanta(eventId);

  const [drawEventCode, setDrawEventCode] = useState("");

  useEffect(() => {
    if (data?.overview.drawEventCode) {
      setDrawEventCode(data.overview.drawEventCode);
    } else if (eventId) {
      setDrawEventCode(buildDefaultEventCode(eventId));
    }
  }, [data?.overview.drawEventCode, eventId]);

  const assignedWishlistItems = data?.overview.assignedUser
    ? data.wishlistItems.filter((item) => item.userId === data.overview.assignedUser?.id)
    : [];

  const wishlistHref = overview?.modules.wishlist ? CANHOES_MEMBER_MODULE_MAP.wishlist.href : "/canhoes";
  const wishlistLabel = overview?.modules.wishlist ? "Abrir wishlist" : "Voltar ao evento";

  const handleDraw = async () => {
    if (!eventId) return;

    try {
      await drawSecretSanta({ eventCode: drawEventCode.trim() || null });
      await refreshOverview();
      toast.success("Sorteio atualizado");
    } catch (e) {
      const message = getErrorMessage(e, "Nao foi possivel gerar o sorteio.");
      logFrontendError("CanhoesSecretSanta.handleDraw", e, { eventId });
      toast.error(message);
    }
  };

  const isBusy = isOverviewLoading || isLoading;
  const badgeLabel = data?.overview.drawEventCode || buildDefaultEventCode(eventId);
  const errorMessage = error ? getErrorMessage(error, "Erro ao carregar amigo secreto.") : null;

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Gift}
        title="Amigo Secreto"
        description="O sorteio, a pessoa que te calhou e a wishlist certa vivem no mesmo fluxo."
        badgeLabel={badgeLabel}
      />

      {isAdmin ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Estado do sorteio</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={drawEventCode}
              onChange={(e) => setDrawEventCode(e.target.value)}
              placeholder="codigo do sorteio"
              className="sm:max-w-xs"
              disabled={!data}
            />
            <Button
              variant="secondary"
              onClick={() => void handleDraw()}
              disabled={isDrawing || !data}
            >
              <Shuffle className="h-4 w-4" />
              {isDrawing ? "A sortear..." : data?.overview.hasDraw ? "Refazer sorteio" : "Gerar sorteio"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SecretSantaContent
          assignedUserName={data?.overview.assignedUser?.name}
          assignedWishlistItems={assignedWishlistItems}
          errorMessage={errorMessage}
          hasAssignment={Boolean(data?.overview.hasAssignment)}
          hasDraw={Boolean(data?.overview.hasDraw)}
          isBusy={isBusy}
          onRetry={() => void refetch()}
          wishlistHref={wishlistHref}
          wishlistLabel={wishlistLabel}
        />
        <WishlistPreviewCard
          myWishlistItemCount={data?.overview.myWishlistItemCount ?? 0}
          wishlistHref={wishlistHref}
          wishlistLabel={wishlistLabel}
        />
      </div>

      {data?.overview.hasAssignment && data.overview.assignedUser ? (
        <AssignedWishlistPanel
          assignedUserName={data.overview.assignedUser.name}
          assignedWishlistItems={assignedWishlistItems}
        />
      ) : null}
    </div>
  );
}
