"use client";

import { useEffect, useState } from "react";
import { Gift, RefreshCw, Shuffle } from "lucide-react";
import { toast } from "sonner";

import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import type { EventAdminSecretSantaStateDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ADMIN_OUTLINE_BUTTON_CLASS } from "./adminContentUi";

type SecretSantaAdminProps = {
  activeEventName: string | null;
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
  state: EventAdminSecretSantaStateDto | null;
};

function buildDefaultEventCode(eventId: string | null) {
  if (eventId) return eventId;
  return `canhoes${new Date().getFullYear()}`;
}

export function SecretSantaAdmin({
  activeEventName,
  eventId,
  loading,
  onUpdate,
  state,
}: Readonly<SecretSantaAdminProps>) {
  const [eventCode, setEventCode] = useState(() => buildDefaultEventCode(eventId));
  const [busy, setBusy] = useState<"draw" | "refresh" | null>(null);
  const drawButtonLabel =
    busy === "draw"
      ? adminCopy.secretSanta.drawing
      : state?.hasDraw
        ? adminCopy.secretSanta.redraw
        : adminCopy.secretSanta.draw;

  useEffect(() => {
    setEventCode(state?.eventCode || buildDefaultEventCode(eventId));
  }, [eventId, state?.eventCode]);

  const handleDraw = async () => {
    if (!eventId) return;

    const hadDrawBefore = Boolean(state?.hasDraw);
    setBusy("draw");
    try {
      await canhoesEventsRepo.adminDrawSecretSanta(eventId, {
        eventCode: eventCode.trim() || null,
      });
      await onUpdate();
      toast.success(hadDrawBefore ? "Sorteio atualizado" : "Sorteio criado");
    } catch (error) {
      logFrontendError("Admin.SecretSanta.draw", error, { eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel gerar o sorteio."));
    } finally {
      setBusy(null);
    }
  };

  const handleRefresh = async () => {
    setBusy("refresh");
    try {
      await onUpdate();
    } catch (error) {
      logFrontendError("Admin.SecretSanta.refresh", error, { eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o estado do sorteio."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="canhoes-paper-panel canhoes-admin-shell-panel border border-[rgba(122,173,58,0.12)] bg-[rgba(15,22,10,0.96)] shadow-[0_16px_32px_rgba(0,0,0,0.14)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--neon-green)]">
            <Gift className="h-4 w-4" />
            <span className="label">{adminCopy.secretSanta.kicker}</span>
          </div>
          <CardTitle>{adminCopy.secretSanta.title}</CardTitle>
          <p className="body-small text-[var(--ink-muted)]">{adminCopy.secretSanta.description}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input
              value={eventCode}
              onChange={(event) => setEventCode(event.target.value)}
              placeholder={buildDefaultEventCode(eventId)}
              disabled={!eventId || busy === "draw"}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRefresh()}
              disabled={!eventId || busy === "refresh" || loading}
              className={`gap-2 ${ADMIN_OUTLINE_BUTTON_CLASS}`}
            >
              <RefreshCw className={busy === "refresh" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              {adminCopy.secretSanta.refresh}
            </Button>

            <Button
              type="button"
              onClick={() => void handleDraw()}
              disabled={!eventId || busy === "draw" || loading}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {drawButtonLabel}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusMetric
              label={adminCopy.secretSanta.editionLabel}
              value={activeEventName ?? adminCopy.controlStrip.activeEventFallback}
              hint={adminCopy.secretSanta.editionHint}
            />
            <StatusMetric
              label={adminCopy.secretSanta.drawLabel}
              value={
                state?.hasDraw
                  ? adminCopy.secretSanta.drawReady
                  : adminCopy.secretSanta.drawMissing
              }
              hint={state?.eventCode ?? buildDefaultEventCode(eventId)}
            />
            <StatusMetric
              label={adminCopy.secretSanta.assignmentsLabel}
              value={String(state?.assignmentCount ?? 0)}
              hint={`${state?.memberCount ?? 0} ${adminCopy.secretSanta.membersHintSuffix}`}
            />
            <StatusMetric
              label={adminCopy.secretSanta.statusLabel}
              value={
                state?.isLocked
                  ? adminCopy.secretSanta.statusLocked
                  : adminCopy.secretSanta.statusOpen
              }
              hint={
                state?.createdAtUtc
                  ? `Criado a ${new Date(state.createdAtUtc).toLocaleString("pt-PT")}`
                  : adminCopy.secretSanta.noDrawHint
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={state?.hasDraw ? "secondary" : "outline"}>
              {state?.hasDraw
                ? adminCopy.secretSanta.available
                : adminCopy.secretSanta.unavailable}
            </Badge>
            {state?.assignmentCount ? (
              <Badge variant="outline">
                {state.assignmentCount} {adminCopy.secretSanta.generatedSuffix}
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusMetric({
  hint,
  label,
  value,
}: Readonly<{
  hint: string;
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-3 py-3 text-[var(--ink-primary)]">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--ink-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">{hint}</p>
    </div>
  );
}
