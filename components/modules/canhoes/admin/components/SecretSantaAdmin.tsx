"use client";

import { useEffect, useState } from "react";
import { Gift, RefreshCw, Shuffle } from "lucide-react";
import { toast } from "sonner";

import type { EventAdminSecretSantaStateDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
      console.error("Admin secret santa draw error:", error);
      toast.error("Nao foi possivel gerar o sorteio");
    } finally {
      setBusy(null);
    }
  };

  const handleRefresh = async () => {
    setBusy("refresh");
    try {
      await onUpdate();
    } catch (error) {
      console.error("Admin secret santa refresh error:", error);
      toast.error("Nao foi possivel atualizar o estado do sorteio");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--neon-green)]">
            <Gift className="h-4 w-4" />
            <span className="label">Amigo secreto</span>
          </div>
          <CardTitle>Sorteio desta edição</CardTitle>
          <p className="body-small text-[var(--beige)]/72">
            O draw usa apenas os membros desta edição. Cada pessoa vê apenas a
            sua atribuição e a wishlist correspondente.
          </p>
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
              className="gap-2"
            >
              <RefreshCw className={busy === "refresh" ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Atualizar
            </Button>

            <Button
              type="button"
              onClick={() => void handleDraw()}
              disabled={!eventId || busy === "draw" || loading}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {busy === "draw" ? "A sortear..." : state?.hasDraw ? "Refazer draw" : "Gerar sorteio"}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatusMetric
              label="Edição"
              value={activeEventName ?? "Sem evento"}
              hint="Contexto atual do sorteio"
            />
            <StatusMetric
              label="Draw"
              value={state?.hasDraw ? "Criado" : "Por gerar"}
              hint={state?.eventCode ?? buildDefaultEventCode(eventId)}
            />
            <StatusMetric
              label="Assignments"
              value={String(state?.assignmentCount ?? 0)}
              hint={`${state?.memberCount ?? 0} membros neste evento`}
            />
            <StatusMetric
              label="Estado"
              value={state?.isLocked ? "Locked" : "Aberto"}
              hint={
                state?.createdAtUtc
                  ? `Criado a ${new Date(state.createdAtUtc).toLocaleString("pt-PT")}`
                  : "Sem sorteio criado"
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={state?.hasDraw ? "secondary" : "outline"}>
              {state?.hasDraw ? "Sorteio disponivel" : "Sem sorteio"}
            </Badge>
            {state?.assignmentCount ? (
              <Badge variant="outline">{state.assignmentCount} atribuicoes geradas</Badge>
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
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--bark)]/62">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-ink)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--bark)]/72">{hint}</p>
    </div>
  );
}
