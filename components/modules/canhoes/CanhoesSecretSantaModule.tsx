"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Gift, ImageOff, Link as LinkIcon, Shuffle, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useEventOverview } from "@/hooks/useEventOverview";
import { absMediaUrl } from "@/lib/media";
import type {
  EventSecretSantaOverviewDto,
  EventWishlistItemDto,
} from "@/lib/api/types";
import { CANHOES_MEMBER_MODULE_MAP } from "@/lib/modules";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawEventCode, setDrawEventCode] = useState(buildDefaultEventCode(null));

  useEffect(() => {
    if (!event) {
      if (!isOverviewLoading) {
        setScreenState({ status: "idle" });
        setDrawEventCode(buildDefaultEventCode(null));
      }
      return;
    }

    const activeEvent = event;
    let isCancelled = false;

    async function loadSecretSantaState() {
      setScreenState({ status: "loading" });

      try {
        const [nextOverview, wishlistItems] = await Promise.all([
          canhoesEventsRepo.getSecretSantaOverview(activeEvent.id),
          canhoesEventsRepo.getWishlist(activeEvent.id),
        ]);

        if (!isCancelled) {
          setScreenState({
            status: "ready",
            overview: nextOverview,
            wishlistItems,
          });
          setDrawEventCode(
            nextOverview.drawEventCode || buildDefaultEventCode(activeEvent.id)
          );
        }
      } catch {
        if (!isCancelled) {
          setScreenState({ status: "error" });
        }
      }
    }

    void loadSecretSantaState();
    return () => {
      isCancelled = true;
    };
  }, [event, isOverviewLoading]);

  const assignedWishlistItems = useMemo(() => {
    if (screenState.status !== "ready" || !screenState.overview.assignedUser) {
      return [];
    }

    return screenState.wishlistItems.filter(
      (wishlistItem) => wishlistItem.userId === screenState.overview.assignedUser?.id
    );
  }, [screenState]);

  const myWishlistItems = useMemo(() => {
    if (screenState.status !== "ready" || !user?.id) return [];
    return screenState.wishlistItems.filter((wishlistItem) => wishlistItem.userId === user.id);
  }, [screenState, user?.id]);

  const wishlistHref = overview?.modules.wishlist
    ? CANHOES_MEMBER_MODULE_MAP.wishlist.href
    : "/canhoes";
  const wishlistLabel = overview?.modules.wishlist
    ? "Abrir wishlist"
    : "Voltar ao evento";

  const handleDraw = async () => {
    if (!event || screenState.status !== "ready") return;

    setIsDrawing(true);
    setScreenState({ status: "loading" });
    try {
      await canhoesEventsRepo.adminDrawSecretSanta(event.id, {
        eventCode: drawEventCode.trim() || null,
      });
      await refreshOverview();
      toast.success("Sorteio atualizado");
    } catch (error) {
      console.error("Secret santa draw error:", error);
      setScreenState({ status: "error" });
      toast.error("Nao foi possivel gerar o sorteio");
    } finally {
      setIsDrawing(false);
    }
  };

  const isBusy = isOverviewLoading || screenState.status === "loading";
  const badgeLabel =
    screenState.status === "ready"
      ? screenState.overview.drawEventCode || buildDefaultEventCode(event?.id)
      : buildDefaultEventCode(event?.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Gift className="h-4 w-4 text-[var(--color-fire)]" />
            Amigo Secreto
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            O sorteio, a pessoa que te calhou e a wishlist certa vivem no mesmo fluxo.
          </p>
        </div>

        <Badge variant="outline">{badgeLabel}</Badge>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Estado do sorteio</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={drawEventCode}
              onChange={(nextEvent) => setDrawEventCode(nextEvent.target.value)}
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
              {isDrawing
                ? "A sortear..."
                : screenState.status === "ready" && screenState.overview.hasDraw
                  ? "Refazer sorteio"
                  : "Gerar sorteio"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--color-fire)]" />
              O teu amigo secreto
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {isBusy ? (
              <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
            ) : null}

            {screenState.status === "ready" &&
            screenState.overview.hasAssignment &&
            screenState.overview.assignedUser ? (
              <div className="canhoes-list-item space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-moss)] text-[var(--color-text-primary)]">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">
                      {screenState.overview.assignedUser.name}
                    </p>
                    <p className="body-small text-[var(--color-text-muted)]">
                      {assignedWishlistItems.length} itens na wishlist atribuida
                    </p>
                  </div>

                  <Badge variant="secondary">shhh</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" asChild>
                    <Link href={wishlistHref}>{wishlistLabel}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={wishlistHref}>{wishlistLabel}</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {screenState.status === "ready" && !screenState.overview.hasDraw ? (
              <div className="canhoes-list-item p-4">
                <p className="body-small text-[var(--color-text-muted)]">
                  Ainda nao existe sorteio para este evento.
                </p>
              </div>
            ) : null}

            {screenState.status === "ready" &&
            screenState.overview.hasDraw &&
            !screenState.overview.hasAssignment ? (
              <div className="canhoes-list-item p-4">
                <p className="body-small text-[var(--color-text-muted)]">
                  O sorteio existe, mas ainda nao ha atribuicao disponivel para o teu perfil.
                </p>
              </div>
            ) : null}

            {screenState.status === "error" ? (
              <div className="canhoes-list-item p-4">
                <p className="body-small text-[var(--color-text-muted)]">
                  Nao foi possivel carregar o contexto do amigo secreto.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

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
              <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                {screenState.status === "ready"
                  ? screenState.overview.myWishlistItemCount
                  : myWishlistItems.length}
              </p>
              <p className="body-small mt-1 text-[var(--color-text-muted)]">
                Quanto mais clara estiver, mais facil e manter o ritual equilibrado.
              </p>
            </div>

            <Button className="w-full" asChild>
              <Link href={wishlistHref}>{wishlistLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {screenState.status === "ready" &&
      screenState.overview.hasAssignment &&
      screenState.overview.assignedUser ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[var(--color-fire)]" />
              Wishlist de {screenState.overview.assignedUser.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {assignedWishlistItems.length === 0 ? (
              <p className="body-small text-[var(--color-text-muted)]">
                Ainda nao ha itens na wishlist. Diz ao teu amigo secreto para adicionar.
              </p>
            ) : null}

            {assignedWishlistItems.map((wishlistItem) => (
              <div key={wishlistItem.id} className="canhoes-list-item flex gap-3 p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                  {wishlistItem.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={absMediaUrl(wishlistItem.imageUrl)}
                      alt={wishlistItem.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <ImageOff className="h-4 w-4 text-[var(--color-text-muted)]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-semibold text-[var(--color-text-primary)]">
                    {wishlistItem.title}
                  </p>
                  {wishlistItem.notes ? (
                    <p className="body-small line-clamp-2 text-[var(--color-text-muted)]">
                      {wishlistItem.notes}
                    </p>
                  ) : null}
                  {wishlistItem.link ? (
                    <a
                      href={wishlistItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="canhoes-link inline-flex items-center gap-1 text-sm"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                      Ver produto
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
