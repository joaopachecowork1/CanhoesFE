"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Gift, ImageOff, Link as LinkIcon, Shuffle, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { pickActiveEvent } from "@/lib/canhoesEvent";
import { absMediaUrl } from "@/lib/media";
import type {
  EventSecretSantaOverviewDto,
  EventSummaryDto,
  EventWishlistItemDto,
} from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SecretSantaState =
  | { status: "loading" }
  | { status: "error" }
  | {
      status: "ready";
      event: EventSummaryDto;
      overview: EventSecretSantaOverviewDto;
      wishlistItems: EventWishlistItemDto[];
    };

function buildDefaultEventCode(event?: EventSummaryDto | null) {
  if (event?.id) return event.id;
  return `canhoes${new Date().getFullYear()}`;
}

async function loadSecretSantaState(): Promise<SecretSantaState> {
  const events = await canhoesEventsRepo.listEvents();
  const activeEvent = pickActiveEvent(events);

  if (!activeEvent) {
    return { status: "error" };
  }

  const [overview, wishlistItems] = await Promise.all([
    canhoesEventsRepo.getSecretSantaOverview(activeEvent.id),
    canhoesEventsRepo.getWishlist(activeEvent.id),
  ]);

  return {
    status: "ready",
    event: activeEvent,
    overview,
    wishlistItems,
  };
}

export function CanhoesSecretSantaModule() {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);

  const [screenState, setScreenState] = useState<SecretSantaState>({ status: "loading" });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawEventCode, setDrawEventCode] = useState<string>(buildDefaultEventCode(null));

  const refresh = useCallback(async () => {
    setScreenState({ status: "loading" });

    try {
      const nextState = await loadSecretSantaState();
      setScreenState(nextState);

      if (nextState.status === "ready") {
        setDrawEventCode(nextState.overview.drawEventCode || buildDefaultEventCode(nextState.event));
      }
    } catch {
      setScreenState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const assignedWishlistItems = useMemo(() => {
    if (screenState.status !== "ready" || !screenState.overview.assignedUser) {
      return [];
    }

    // The user only ever sees wishlist items from their assigned friend inside
    // the active event context, never the full member wishlist catalogue.
    return screenState.wishlistItems.filter(
      (wishlistItem) => wishlistItem.userId === screenState.overview.assignedUser?.id
    );
  }, [screenState]);

  const myWishlistItems = useMemo(() => {
    if (screenState.status !== "ready" || !user?.id) return [];
    return screenState.wishlistItems.filter((wishlistItem) => wishlistItem.userId === user.id);
  }, [screenState, user?.id]);

  const handleDraw = async () => {
    if (screenState.status !== "ready") return;

    setIsDrawing(true);
    try {
      await canhoesEventsRepo.adminDrawSecretSanta(screenState.event.id, {
        eventCode: drawEventCode.trim() || null,
      });
      await refresh();
      toast.success("Sorteio atualizado");
    } catch (error) {
      console.error("Secret santa draw error:", error);
      toast.error("Nao foi possivel gerar o sorteio");
    } finally {
      setIsDrawing(false);
    }
  };

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

        <Badge variant="outline">
          {screenState.status === "ready"
            ? screenState.overview.drawEventCode || buildDefaultEventCode(screenState.event)
            : buildDefaultEventCode(null)}
        </Badge>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Estado do sorteio</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={drawEventCode}
              onChange={(event) => setDrawEventCode(event.target.value)}
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
            {screenState.status === "loading" ? (
              <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
            ) : null}

            {screenState.status === "ready" && screenState.overview.hasAssignment && screenState.overview.assignedUser ? (
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
                    <Link href="/canhoes/wishlist">Abrir wishlist</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/canhoes/wishlist">Gerir a tua wishlist</Link>
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

            {screenState.status === "ready" && screenState.overview.hasDraw && !screenState.overview.hasAssignment ? (
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
              <Link href="/canhoes/wishlist">Atualizar wishlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {screenState.status === "ready" && screenState.overview.hasAssignment && screenState.overview.assignedUser ? (
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
