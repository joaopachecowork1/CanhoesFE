"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gift, Link as LinkIcon, Shuffle, User } from "lucide-react";
import { toast } from "sonner";

import {
  CanhoesMediaThumb,
  CanhoesModuleHeader,
} from "@/components/modules/canhoes/CanhoesModuleParts";
import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import type {
  EventSecretSantaOverviewDto,
  EventWishlistItemDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { CANHOES_MEMBER_MODULE_MAP } from "@/lib/modules";
import { normalizeWishlistItems } from "@/lib/api/responseNormalization";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VirtualizedList } from "@/components/ui/virtualized-list";

type SecretSantaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      overview: EventSecretSantaOverviewDto;
      wishlistItems: EventWishlistItemDto[];
    };

function buildDefaultEventCode(eventId?: string | null) {
  if (eventId) return eventId;
  return `canhoes${new Date().getFullYear()}`;
}

function SecretSantaLoadingState() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-44 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-20 w-full rounded-[var(--radius-md-token)]" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </CardContent>
    </Card>
  );
}

function SecretSantaAssignmentCard({
  assignedUserName,
  assignedWishlistItems,
  wishlistHref,
  wishlistLabel,
}: Readonly<{
  assignedUserName: string;
  assignedWishlistItems: EventWishlistItemDto[];
  wishlistHref: string;
  wishlistLabel: string;
}>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--color-fire)]" />
          O teu amigo secreto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="canhoes-list-item space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--moss),var(--neon-cyan))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-[var(--color-text-primary)]">{assignedUserName}</p>
              <p className="body-small text-[var(--color-text-muted)]">
                {assignedWishlistItems.length} itens na wishlist atribuida
              </p>
            </div>
            <Badge variant="amber">shhh</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={wishlistHref}>{wishlistLabel}</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistPreviewCard({
  myWishlistItemCount,
  wishlistHref,
  wishlistLabel,
}: Readonly<{
  myWishlistItemCount: number;
  wishlistHref: string;
  wishlistLabel: string;
}>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-[var(--color-fire)]" />
          A tua preparacao
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="canhoes-list-item p-4">
          <p className="canhoes-field-label">A tua wishlist</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{myWishlistItemCount}</p>
          <p className="body-small mt-1 text-[var(--color-text-muted)]">
            Quanto mais clara estiver, mais facil e manter o ritual equilibrado.
          </p>
        </div>
        <Button className="w-full" asChild>
          <Link href={wishlistHref}>{wishlistLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AssignedWishlistPanel({
  assignedWishlistItems,
  assignedUserName,
}: Readonly<{
  assignedWishlistItems: EventWishlistItemDto[];
  assignedUserName: string;
}>) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-[var(--color-fire)]" />
          Wishlist de {assignedUserName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignedWishlistItems.length === 0 ? (
          <p className="body-small text-[var(--color-text-muted)]">
            Ainda nao ha itens na wishlist. Diz ao teu amigo secreto para adicionar.
          </p>
        ) : (
          <VirtualizedList
            items={assignedWishlistItems}
            getKey={(wishlistItem) => wishlistItem.id}
            estimateSize={() => 92}
            className="max-h-[50svh]"
            renderItem={(wishlistItem) => (
              <div className="canhoes-list-item flex gap-3 p-3">
                <CanhoesMediaThumb alt={wishlistItem.title} src={wishlistItem.imageUrl} />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">{wishlistItem.title}</p>
                  {wishlistItem.notes ? (
                    <p className="body-small line-clamp-2 text-[var(--color-text-muted)]">{wishlistItem.notes}</p>
                  ) : null}
                  {wishlistItem.link ? (
                    <a href={wishlistItem.link} target="_blank" rel="noreferrer" className="canhoes-link inline-flex items-center gap-1 text-sm">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Ver produto
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function CanhoesSecretSantaModule() {
  const { user } = useAuth();
  const eventOverview = useEventOverview();
  const {
    event,
    overview,
    refresh: refreshOverview,
    isLoading: isOverviewLoading,
  } = eventOverview;
  const isAdmin =
    Boolean(user?.isAdmin) || Boolean(eventOverview.overview?.permissions.isAdmin);

  const [screenState, setScreenState] = useState<SecretSantaState>({ status: "idle" });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawEventCode, setDrawEventCode] = useState(buildDefaultEventCode(null));
  const loadedEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!event) {
      loadedEventIdRef.current = null;
      if (!isOverviewLoading) {
        setScreenState({ status: "idle" });
        setErrorMessage(null);
        setDrawEventCode(buildDefaultEventCode(null));
      }
      return;
    }

    const activeEvent = event;
    const isFirstLoadForEvent = loadedEventIdRef.current !== activeEvent.id;
    loadedEventIdRef.current = activeEvent.id;
    let isCancelled = false;

    async function loadSecretSantaState() {
      if (isFirstLoadForEvent) {
        setScreenState({ status: "loading" });
      }
      setErrorMessage(null);

      try {
        const [nextOverview, wishlistItems] = await Promise.all([
          canhoesEventsRepo.getSecretSantaOverview(activeEvent.id),
          canhoesEventsRepo.getWishlist(activeEvent.id),
        ]);

        if (!isCancelled) {
          setScreenState({
            status: "ready",
            overview: nextOverview,
            wishlistItems: normalizeWishlistItems(wishlistItems),
          });
          setDrawEventCode(nextOverview.drawEventCode || buildDefaultEventCode(activeEvent.id));
        }
      } catch (error) {
        if (!isCancelled) {
          const message = getErrorMessage(error, "Nao foi possivel carregar o contexto do amigo secreto.");
          logFrontendError("CanhoesSecretSanta.loadSecretSantaState", error, { eventId: activeEvent.id });
          setScreenState({ status: "error" });
          setErrorMessage(message);
        }
      }
    }

    void loadSecretSantaState();
    return () => {
      isCancelled = true;
    };
  }, [event, isOverviewLoading]);

  const assignedWishlistItems = useMemo(() => {
    if (screenState.status !== "ready" || !screenState.overview.assignedUser) return [];
    return normalizeWishlistItems(screenState.wishlistItems).filter(
      (item) => item.userId === screenState.overview.assignedUser?.id
    );
  }, [screenState]);

  const retryLoad = useCallback(() => {
    setErrorMessage(null);
    if (!event) return;

    const loadSecretSantaState = async () => {
      try {
        const [nextOverview, wishlistItems] = await Promise.all([
          canhoesEventsRepo.getSecretSantaOverview(event.id),
          canhoesEventsRepo.getWishlist(event.id),
        ]);

        setScreenState({
          status: "ready",
          overview: nextOverview,
          wishlistItems: normalizeWishlistItems(wishlistItems),
        });
        setDrawEventCode(nextOverview.drawEventCode || buildDefaultEventCode(event.id));
      } catch (error) {
        const message = getErrorMessage(error, "Nao foi possivel carregar o contexto do amigo secreto.");
        logFrontendError("CanhoesSecretSanta.retryLoadSecretSantaState", error, { eventId: event.id });
        setScreenState({ status: "error" });
        setErrorMessage(message);
      }
    };

    void loadSecretSantaState();
  }, [event]);

  const wishlistHref = overview?.modules.wishlist ? CANHOES_MEMBER_MODULE_MAP.wishlist.href : "/canhoes";
  const wishlistLabel = overview?.modules.wishlist ? "Abrir wishlist" : "Voltar ao evento";

  const handleDraw = async () => {
    if (!event || screenState.status !== "ready") return;

    setIsDrawing(true);
    try {
      await canhoesEventsRepo.adminDrawSecretSanta(event.id, { eventCode: drawEventCode.trim() || null });
      await refreshOverview();
      toast.success("Sorteio atualizado");
    } catch (error) {
      const message = getErrorMessage(error, "Nao foi possivel gerar o sorteio.");
      logFrontendError("CanhoesSecretSanta.handleDraw", error, { eventId: event.id });
      setScreenState({ status: "error" });
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsDrawing(false);
    }
  };

  const isBusy = isOverviewLoading || screenState.status === "loading";
  const badgeLabel = screenState.status === "ready"
    ? screenState.overview.drawEventCode || buildDefaultEventCode(event?.id)
    : buildDefaultEventCode(event?.id);

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
              disabled={screenState.status !== "ready"}
            />
            <Button
              variant="secondary"
              onClick={() => void handleDraw()}
              disabled={isDrawing || screenState.status !== "ready"}
            >
              <Shuffle className="h-4 w-4" />
              {isDrawing ? "A sortear..." : screenState.status === "ready" && screenState.overview.hasDraw ? "Refazer sorteio" : "Gerar sorteio"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <SecretSantaContent
          assignedUserName={screenState.status === "ready" ? screenState.overview.assignedUser?.name : undefined}
          assignedWishlistItems={assignedWishlistItems}
          errorMessage={errorMessage}
          hasAssignment={screenState.status === "ready" && screenState.overview.hasAssignment}
          hasDraw={screenState.status === "ready" && screenState.overview.hasDraw}
          isBusy={isBusy}
          onRetry={retryLoad}
          wishlistHref={wishlistHref}
          wishlistLabel={wishlistLabel}
        />
        <WishlistPreviewCard
          myWishlistItemCount={screenState.status === "ready" ? screenState.overview.myWishlistItemCount : 0}
          wishlistHref={wishlistHref}
          wishlistLabel={wishlistLabel}
        />
      </div>

      {screenState.status === "ready" && screenState.overview.hasAssignment && screenState.overview.assignedUser ? (
        <AssignedWishlistPanel
          assignedUserName={screenState.overview.assignedUser.name}
          assignedWishlistItems={assignedWishlistItems}
        />
      ) : null}
    </div>
  );
}

function SecretSantaContent({
  assignedUserName,
  assignedWishlistItems,
  errorMessage,
  hasAssignment,
  hasDraw,
  isBusy,
  onRetry,
  wishlistHref,
  wishlistLabel,
}: Readonly<{
  assignedUserName?: string;
  assignedWishlistItems: EventWishlistItemDto[];
  errorMessage: string | null;
  hasAssignment: boolean;
  hasDraw: boolean;
  isBusy: boolean;
  onRetry: () => void;
  wishlistHref: string;
  wishlistLabel: string;
}>) {
  if (isBusy) {
    return <SecretSantaLoadingState />;
  }

  if (errorMessage) {
    return (
      <Card>
        <CardContent className="py-6">
          <ErrorAlert
            title="Erro ao carregar o amigo secreto"
            description={errorMessage}
            actionLabel="Tentar novamente"
            onAction={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  if (hasAssignment && assignedUserName) {
    return (
      <SecretSantaAssignmentCard
        assignedUserName={assignedUserName}
        assignedWishlistItems={assignedWishlistItems}
        wishlistHref={wishlistHref}
        wishlistLabel={wishlistLabel}
      />
    );
  }

  const statusMessage = hasDraw
    ? "O sorteio existe, mas ainda nao ha atribuicao disponivel para o teu perfil."
    : "Ainda nao existe sorteio para este evento.";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--color-fire)]" />
          O teu amigo secreto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="canhoes-list-item p-4">
          <p className="body-small text-[var(--color-text-muted)]">{statusMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
}
