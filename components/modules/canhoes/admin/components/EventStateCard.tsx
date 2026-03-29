"use client";

import { useMemo, useState } from "react";
import { Eye, Sparkles, TimerReset } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type {
  EventAdminModuleVisibilityDto,
  EventAdminStateDto,
  EventPhaseDto,
  EventSummaryDto,
} from "@/lib/api/types";

type EventStateCardProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: EventSummaryDto[];
  onActivateEvent: (eventId: string) => Promise<void>;
  onUpdate: () => Promise<void>;
  state: EventAdminStateDto | null;
};

const MODULE_LABELS: Array<{
  description: string;
  key: keyof EventAdminModuleVisibilityDto;
  label: string;
}> = [
  {
    key: "feed",
    label: "Feed",
    description: "Mantem o feed principal visivel para membros.",
  },
  {
    key: "secretSanta",
    label: "Amigo secreto",
    description: "Mostra o modulo de sorteio e atribuicao.",
  },
  {
    key: "wishlist",
    label: "Wishlist",
    description: "Permite gerir pistas e desejos do grupo.",
  },
  {
    key: "categories",
    label: "Categorias",
    description: "Exibe o arquivo e o ranking do evento.",
  },
  {
    key: "voting",
    label: "Votacao",
    description: "Liberta o modulo de voto para membros.",
  },
  {
    key: "gala",
    label: "Gala",
    description: "Abre a area final de resultados.",
  },
  {
    key: "stickers",
    label: "Stickers",
    description: "Mostra submissao e consulta de stickers.",
  },
  {
    key: "measures",
    label: "Medidas",
    description: "Mostra regras e medidas do evento.",
  },
  {
    key: "nominees",
    label: "Nomeacoes",
    description: "Mostra arquivo de nomeados para membros.",
  },
];

function getPhaseLabel(phaseType?: string | null) {
  switch (phaseType) {
    case "DRAW":
      return "DRAW";
    case "PROPOSALS":
      return "PROPOSALS";
    case "VOTING":
      return "VOTING";
    case "RESULTS":
      return "RESULTS";
    default:
      return "Sem fase";
  }
}

function formatPhaseWindow(phase: EventPhaseDto) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(phase.endDate));
}

export function EventStateCard({
  activeEventName,
  eventId,
  events,
  onActivateEvent,
  onUpdate,
  state,
}: Readonly<EventStateCardProps>) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const visibleModulesCount = useMemo(() => {
    if (!state) return 0;
    return Object.values(state.effectiveModules).filter(Boolean).length;
  }, [state]);

  const persistState = async (
    busyStateKey: string,
    patch: {
      moduleVisibility?: EventAdminModuleVisibilityDto;
      nominationsVisible?: boolean;
      resultsVisible?: boolean;
    }
  ) => {
    if (!eventId || !state) return;

    setBusyKey(busyStateKey);
    try {
      await canhoesEventsRepo.updateAdminState(eventId, patch);
      await onUpdate();
      toast.success("Controlo do evento atualizado");
    } catch (error) {
      console.error("Admin state update error:", error);
      toast.error("Nao foi possivel guardar o estado");
    } finally {
      setBusyKey(null);
    }
  };

  const updatePhase = async (phaseType: EventPhaseDto["type"]) => {
    if (!eventId) return;

    setBusyKey("phase");
    try {
      await canhoesEventsRepo.updateAdminPhase(eventId, { phaseType });
      await onUpdate();
      toast.success("Fase do evento atualizada");
    } catch (error) {
      console.error("Admin phase update error:", error);
      toast.error("Nao foi possivel mudar a fase");
    } finally {
      setBusyKey(null);
    }
  };

  const activateEvent = async (nextEventId: string) => {
    if (!nextEventId || nextEventId === eventId) {
      return;
    }

    setBusyKey("event");
    try {
      await onActivateEvent(nextEventId);
    } finally {
      setBusyKey(null);
    }
  };

  if (!state) {
    return (
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardContent className="py-6 text-sm text-[var(--beige)]/76">
          Falta uma edicao ativa para abrir os controlos globais.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--neon-green)]">
            <TimerReset className="h-4 w-4" />
            <span className="label">Edição</span>
          </div>
          <CardTitle>Evento ativo, fase e calendário</CardTitle>
          <p className="body-small text-[var(--beige)]/72">
            É aqui que decides que edição está aberta, em que fase vai o ciclo
            e quando cada janela termina.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <p className="label text-[var(--beige)]/68">Evento ativo</p>
              <Select
                value={eventId ?? ""}
                onValueChange={(value) => void activateEvent(value)}
                disabled={busyKey === "event" || events.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
              <p className="label text-[var(--bark)]/62">Edição em curso</p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-ink)]">
                {activeEventName ?? "Sem evento"}
              </p>
              <p className="mt-1 text-xs text-[var(--bark)]/72">
                Trocar a edição atualiza a shell, os módulos e a moderação.
              </p>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <p className="label text-[var(--beige)]/68">Fase ativa</p>
              <Select
                value={state.activePhase?.type ?? ""}
                onValueChange={(value) => void updatePhase(value as EventPhaseDto["type"])}
                disabled={busyKey === "phase"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher fase" />
                </SelectTrigger>
                <SelectContent>
                  {state.phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.type}>
                      {getPhaseLabel(phase.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
                <p className="label text-[var(--bark)]/62">Módulos visíveis</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-ink)]">
                  {visibleModulesCount}
                </p>
                <p className="mt-1 text-xs text-[var(--bark)]/72">O que os membros veem agora</p>
              </div>
              <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
                <p className="label text-[var(--bark)]/62">Pendentes</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--text-ink)]">
                  {state.counts.pendingProposalCount}
                </p>
                <p className="mt-1 text-xs text-[var(--bark)]/72">Itens por rever</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {state.phases.map((phase) => (
              <div key={phase.id} className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-ink)]">
                    {getPhaseLabel(phase.type)}
                  </p>
                  {phase.isActive ? <Badge variant="secondary">Ativa</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-[var(--bark)]/72">
                  Fecha a {formatPhaseWindow(phase)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-primary)] shadow-[var(--shadow-panel)]">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--neon-cyan)]">
            <Eye className="h-4 w-4" />
            <span className="label">Acesso</span>
          </div>
          <CardTitle>O que fica aberto para o grupo</CardTitle>
          <p className="body-small text-[var(--beige)]/72">
            A fase continua a mandar, mas a mesa da edição pode esconder áreas
            que ainda não devem entrar em jogo.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <VisibilityToggle
              checked={state.nominationsVisible}
              description="Mostra nomeacoes aos membros durante a fase certa."
              label="Nomeacoes visiveis"
              onChange={(checked) =>
                void persistState("nominations", { nominationsVisible: checked })
              }
              pending={busyKey === "nominations"}
            />
            <VisibilityToggle
              checked={state.resultsVisible}
              description="Liberta ranking e resultados fora da gala quando precisares."
              label="Resultados visiveis"
              onChange={(checked) =>
                void persistState("results", { resultsVisible: checked })
              }
              pending={busyKey === "results"}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {MODULE_LABELS.map((module) => (
              <VisibilityToggle
                key={module.key}
                checked={state.moduleVisibility[module.key]}
                description={module.description}
                hint={state.effectiveModules[module.key] ? "Ativo para membros" : "Oculto aos membros"}
                label={module.label}
                onChange={(checked) =>
                  void persistState(module.key, {
                    moduleVisibility: {
                      ...state.moduleVisibility,
                      [module.key]: checked,
                    },
                  })
                }
                pending={busyKey === module.key}
              />
            ))}
          </div>

          <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-3">
            <div className="flex items-center gap-2 text-[var(--text-ink)]">
              <Sparkles className="h-4 w-4 text-[var(--neon-green)]" />
              <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em]">
                Regra de visibilidade
              </p>
            </div>
            <p className="mt-2 text-sm text-[var(--bark)]/76">
              Estes toggles escondem módulos mesmo quando a fase já os permitir.
              São o ajuste fino da edição, não substituem a fase ativa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VisibilityToggle({
  checked,
  description,
  hint,
  label,
  onChange,
  pending,
}: Readonly<{
  checked: boolean;
  description: string;
  hint?: string;
  label: string;
  onChange: (checked: boolean) => void;
  pending: boolean;
}>) {
  return (
    <div className="canhoes-paper-card rounded-[var(--radius-md-token)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-ink)]">
            {label}
          </p>
          <p className="text-sm text-[var(--bark)]/76">{description}</p>
          {hint ? (
            <p className="text-xs text-[var(--bark)]/62">{hint}</p>
          ) : null}
        </div>
        <Switch checked={checked} disabled={pending} onCheckedChange={onChange} />
      </div>
    </div>
  );
}
