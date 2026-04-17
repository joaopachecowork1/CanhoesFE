"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronRight, Layers, Settings2, Timer, ToggleRight } from "lucide-react";
import { toast } from "sonner";

import type {
  AdminModuleKey,
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useModuleVisibility, type ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  ADMIN_CONTENT_CARD_CLASS,
  ADMIN_OUTLINE_BUTTON_CLASS,
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_ITEM_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
  AdminDetailSheet,
} from "./adminContentUi";
import { AdminStateMessage } from "./AdminStateMessage";

export const PHASE_LABELS: Record<EventPhaseDto["type"], string> = {
  PROPOSALS: "Nomeações",
  VOTING: "Votação",
  RESULTS: "Resultados",
  DRAW: "Sorteio",
};

export const PHASE_OPTIONS = Object.keys(PHASE_LABELS) as EventPhaseDto["type"][];

export const QUICK_MODULE_ORDER: readonly AdminModuleKey[] = [
  "feed",
  "nominees",
  "categories",
  "secretSanta",
] as const;

export const ADVANCED_MODULE_ORDER: readonly AdminModuleKey[] = [
  "wishlist",
  "voting",
  "stickers",
  "measures",
  "gala",
] as const;

export function formatPhaseLabel(phaseType: EventPhaseDto["type"] | null | undefined) {
  if (!phaseType) return "Sem fase";
  return PHASE_LABELS[phaseType];
}

export function selectModuleItems(
  order: readonly AdminModuleKey[],
  itemsByKey: Partial<Record<AdminModuleKey, ModuleVisibilityItem>>
) {
  return order
    .map((key) => itemsByKey[key])
    .filter((item): item is ModuleVisibilityItem => Boolean(item));
}

export type SettingsFeedbackState = {
  message: string;
  tone: FeedbackTone;
};

type AdminControlCenterProps = {
  activeEventName: string | null;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  onRefresh: () => Promise<void>;
  state: EventAdminStateDto | null;
};

type VisibilityActionMessages = {
  error: string;
  saving: string;
  success: string;
};

function getModuleFeedback(label: string): VisibilityActionMessages {
  const labelLower = label.toLowerCase();
  return {
    saving: `A guardar ${labelLower}...`,
    success: `${label} atualizado.`,
    error: `Falha ao guardar ${labelLower}.`,
  };
}

function buildModuleItemsByKey(moduleItems: ModuleVisibilityItem[]) {
  return Object.fromEntries(moduleItems.map((item) => [item.key, item])) as Partial<
    Record<AdminModuleKey, ModuleVisibilityItem>
  >;
}

export function AdminControlCenter({
  activeEventName,
  eventId,
  events,
  loading,
  onRefresh,
  state,
}: Readonly<AdminControlCenterProps>) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [feedback, setFeedback] = useState<SettingsFeedbackState | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const {
    allDisabled,
    allEnabled,
    moduleItems,
    savingKey: visibilitySavingKey,
    setAllModules,
    setNominationsVisible,
    setResultsVisible,
    toggleModule,
    visibleCount,
  } = useModuleVisibility({
    eventId,
    onUpdate: onRefresh,
    state,
  });

  const moduleItemsByKey = useMemo(() => buildModuleItemsByKey(moduleItems), [moduleItems]);
  const quickModuleItems = useMemo(
    () => selectModuleItems(QUICK_MODULE_ORDER, moduleItemsByKey),
    [moduleItemsByKey]
  );
  const advancedModuleItems = useMemo(
    () => selectModuleItems(ADVANCED_MODULE_ORDER, moduleItemsByKey),
    [moduleItemsByKey]
  );

  if (!state) {
    return <AdminStateMessage variant="panel">Falta uma edição ativa para abrir os controlos.</AdminStateMessage>;
  }

  const currentState = state;
  const activeEventLabel = activeEventName ?? "Sem edição ativa";
  const currentPhaseLabel = formatPhaseLabel(currentState.activePhase?.type);
  const pendingCount = currentState.counts.pendingProposalCount ?? 0;

  async function runVisibilityAction(messages: VisibilityActionMessages, action: () => Promise<boolean>) {
    setFeedback({ message: messages.saving, tone: "default" });
    const ok = await action();
    setFeedback({
      message: ok ? messages.success : messages.error,
      tone: ok ? "success" : "error",
    });
    return ok;
  }

  async function handleUpdatePhase(phaseType: EventPhaseDto["type"]) {
    if (!eventId || phaseType === currentState.activePhase?.type) return;

    setSavingKey("phase");
    setFeedback({ message: "A guardar fase...", tone: "default" });

    try {
      await canhoesEventsRepo.updateAdminPhase(eventId, { phaseType });
      await onRefresh();
      toast.success("Fase do evento atualizada");
      setFeedback({
        message: `Fase atualizada para ${PHASE_LABELS[phaseType]}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.updatePhase", error, { phaseType });
      toast.error(getErrorMessage(error, "Não foi possível mudar a fase."));
      setFeedback({
        message: "Falha ao guardar a fase atual.",
        tone: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  async function handleActivateEvent(eventIdToActivate: string) {
    if (!eventIdToActivate || eventIdToActivate === eventId) return;

    setSavingKey("event");
    setFeedback({ message: "A mudar evento ativo...", tone: "default" });

    try {
      await canhoesEventsRepo.adminActivateEvent(eventIdToActivate);
      await onRefresh();
      toast.success("Evento ativo atualizado");

      const nextEventName =
        events.find((event) => event.id === eventIdToActivate)?.name ?? "evento";

      setFeedback({
        message: `Evento ativo atualizado para ${nextEventName}.`,
        tone: "success",
      });
    } catch (error) {
      logFrontendError("AdminControlCenter.activateEvent", error, {
        eventId: eventIdToActivate,
      });
      toast.error(getErrorMessage(error, "Não foi possível mudar o evento ativo."));
      setFeedback({
        message: "Falha ao atualizar o evento ativo.",
        tone: "error",
      });
    } finally {
      setSavingKey(null);
    }
  }

  function handleModuleToggle(item: ModuleVisibilityItem, checked: boolean) {
    void runVisibilityAction(getModuleFeedback(item.label), () => toggleModule(item.key, checked));
  }

  function handleNominationsVisibility(checked: boolean) {
    void runVisibilityAction(
      {
        saving: "A guardar exposição de nomeações...",
        success: checked ? "Nomeações abertas ao grupo." : "Nomeações ocultadas do grupo.",
        error: "Falha ao guardar a exposição de nomeações.",
      },
      () => setNominationsVisible(checked)
    );
  }

  function handleResultsVisibility(checked: boolean) {
    void runVisibilityAction(
      {
        saving: "A guardar exposição de resultados...",
        success: checked ? "Resultados abertos ao grupo." : "Resultados ocultados do grupo.",
        error: "Falha ao guardar a exposição de resultados.",
      },
      () => setResultsVisible(checked)
    );
  }

  function handleSetAllModules(visible: boolean) {
    void runVisibilityAction(
      {
        saving: visible ? "A ativar todos os módulos..." : "A desativar todos os módulos...",
        success: visible ? "Todos os módulos ficaram ativos." : "Todos os módulos ficaram ocultos.",
        error: visible ? "Falha ao ativar todos os módulos." : "Falha ao desativar todos os módulos.",
      },
      () => setAllModules(visible)
    );
  }

  return (
    <div className="space-y-3">
      <AdminSettingsMainPanel
        activeEventLabel={activeEventLabel}
        currentPhaseLabel={currentPhaseLabel}
        eventId={eventId}
        events={events}
        feedback={!advancedOpen ? feedback : null}
        loading={loading}
        moduleCount={moduleItems.length}
        onActivateEvent={(value) => void handleActivateEvent(value)}
        onOpenAdvanced={() => setAdvancedOpen(true)}
        onToggleQuickModule={handleModuleToggle}
        onUpdatePhase={(phase) => void handleUpdatePhase(phase)}
        pendingCount={pendingCount}
        phaseLabels={PHASE_LABELS}
        phaseOptions={PHASE_OPTIONS}
        quickModuleItems={quickModuleItems}
        savingKey={savingKey}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
        visibleCount={visibleCount}
      />

      <AdminSettingsAdvancedSheet
        advancedModuleItems={advancedModuleItems}
        allDisabled={allDisabled}
        allEnabled={allEnabled}
        feedback={feedback}
        onOpenChange={setAdvancedOpen}
        onSetAllModules={handleSetAllModules}
        onSetNominationsVisible={handleNominationsVisibility}
        onSetResultsVisible={handleResultsVisibility}
        onToggleAdvancedModule={handleModuleToggle}
        open={advancedOpen}
        state={currentState}
        visibilitySavingKey={visibilitySavingKey}
      />
    </div>
  );
}

export type FeedbackTone = "default" | "error" | "success";

export const SELECT_TRIGGER_CLASS = ADMIN_SELECT_TRIGGER_CLASS;

export const SELECT_CONTENT_CLASS = ADMIN_SELECT_CONTENT_CLASS;

export const SELECT_ITEM_CLASS = ADMIN_SELECT_ITEM_CLASS;

export const OUTLINE_BUTTON_CLASS = ADMIN_OUTLINE_BUTTON_CLASS;

const CONTROL_BLOCK_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-3 py-2.5";

type ControlBlockProps = {
  action?: ReactNode;
  children: ReactNode;
  icon: ReactNode;
  subtitle?: ReactNode;
  title: string;
};

type FeedbackNoticeProps = {
  feedback: {
    message: string;
    tone: FeedbackTone;
  } | null;
};

type QuickMetricProps = {
  label: string;
  value: string;
};

type VisibilityRowProps = {
  checked: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
  pending: boolean;
};

type VisibilityTileProps = VisibilityRowProps;

function FeedbackNotice({ feedback }: Readonly<FeedbackNoticeProps>) {
  if (!feedback) return null;

  const toneClass =
    feedback.tone === "error"
      ? "border-[rgba(224,90,58,0.24)] bg-[rgba(224,90,58,0.06)] text-[var(--danger)]"
      : feedback.tone === "success"
      ? "border-[rgba(76,175,80,0.28)] bg-[rgba(76,175,80,0.06)] text-[var(--success)]"
      : "border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] text-[var(--ink-muted)]";

  return (
    <div className={`rounded-[var(--radius-md-token)] border px-3 py-1.5 text-[13px] ${toneClass}`}>
      {feedback.message}
    </div>
  );
}

function ControlBlock({
  action,
  children,
  icon,
  subtitle,
  title,
}: Readonly<ControlBlockProps>) {
  return (
    <section className={CONTROL_BLOCK_CLASS}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[var(--ink-primary)]">
            <span className="text-[var(--moss-glow)]">{icon}</span>
            <p className="text-[13px] font-semibold">{title}</p>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

function VisibilityTile({
  checked,
  id,
  label,
  onChange,
  pending,
}: Readonly<VisibilityTileProps>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <Label
          htmlFor={id}
          className="min-w-0 cursor-pointer text-[13px] font-medium text-[var(--ink-primary)]"
        >
          {label}
        </Label>
        <Switch id={id} checked={checked} disabled={pending} onCheckedChange={onChange} />
      </div>

      <p className="mt-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {pending ? "A guardar" : checked ? "Ativo" : "Oculto"}
      </p>
    </div>
  );
}

function VisibilityRow({
  checked,
  id,
  label,
  onChange,
  pending,
}: Readonly<VisibilityRowProps>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] min-h-11 px-3 py-2">
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-[var(--ink-primary)]"
        >
          {label}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        {pending ? (
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
            A guardar
          </span>
        ) : null}
        <Switch id={id} checked={checked} disabled={pending} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

function QuickMetric({ label, value }: Readonly<QuickMetricProps>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-3 py-2">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--ink-primary)]" title={value}>
        {value}
      </p>
    </div>
  );
}

type SharedProps = {
  feedback: SettingsFeedbackState | null;
  visibilitySavingKey: string | null;
};

type MainPanelProps = SharedProps & {
  activeEventLabel: string;
  currentPhaseLabel: string;
  eventId: string | null;
  events: Array<{ id: string; name: string }>;
  loading: boolean;
  moduleCount: number;
  onActivateEvent: (eventIdToActivate: string) => void;
  onOpenAdvanced: () => void;
  onToggleQuickModule: (item: ModuleVisibilityItem, checked: boolean) => void;
  onUpdatePhase: (phaseType: EventPhaseDto["type"]) => void;
  pendingCount: number;
  phaseOptions: EventPhaseDto["type"][];
  phaseLabels: Record<EventPhaseDto["type"], string>;
  quickModuleItems: ModuleVisibilityItem[];
  savingKey: string | null;
  state: EventAdminStateDto;
  visibleCount: number;
};

type AdvancedSheetProps = SharedProps & {
  advancedModuleItems: ModuleVisibilityItem[];
  allDisabled: boolean;
  allEnabled: boolean;
  onOpenChange: (open: boolean) => void;
  onSetAllModules: (visible: boolean) => void;
  onSetNominationsVisible: (checked: boolean) => void;
  onSetResultsVisible: (checked: boolean) => void;
  onToggleAdvancedModule: (item: ModuleVisibilityItem, checked: boolean) => void;
  open: boolean;
  state: EventAdminStateDto;
};

function AdminSettingsMainPanel({
  activeEventLabel,
  currentPhaseLabel,
  eventId,
  events,
  feedback,
  loading,
  moduleCount,
  onActivateEvent,
  onOpenAdvanced,
  onToggleQuickModule,
  onUpdatePhase,
  pendingCount,
  phaseLabels,
  phaseOptions,
  quickModuleItems,
  savingKey,
  state,
  visibilitySavingKey,
  visibleCount,
}: Readonly<MainPanelProps>) {
  return (
    <Card className={ADMIN_CONTENT_CARD_CLASS}>
      <CardHeader className="space-y-1.5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--neon-green)]">Operacional</p>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--neon-green)]" />
              Evento
            </CardTitle>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className={`gap-1.5 ${OUTLINE_BUTTON_CLASS}`}
            onClick={onOpenAdvanced}
          >
            Avançado
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <FeedbackNotice feedback={feedback} />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <ControlBlock
            icon={<Layers className="h-4 w-4" />}
            title="Evento ativo"
            subtitle={activeEventLabel}
          >
            <Select
              value={eventId ?? ""}
              onValueChange={onActivateEvent}
              disabled={savingKey === "event" || events.length === 0}
            >
              <SelectTrigger className={`${SELECT_TRIGGER_CLASS} h-10`}>
                <SelectValue placeholder="Selecionar evento" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id} className={SELECT_ITEM_CLASS}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ControlBlock>

          <ControlBlock
            icon={<Timer className="h-4 w-4" />}
            title="Fase atual"
            subtitle={currentPhaseLabel}
          >
            <Select
              value={state.activePhase?.type ?? ""}
              onValueChange={(value) => onUpdatePhase(value as EventPhaseDto["type"])}
              disabled={savingKey === "phase" || loading}
            >
              <SelectTrigger className={`${SELECT_TRIGGER_CLASS} h-10`}>
                <SelectValue placeholder="Selecionar fase" />
              </SelectTrigger>
              <SelectContent className={SELECT_CONTENT_CLASS}>
                {phaseOptions.map((phase) => (
                  <SelectItem key={phase} value={phase} className={SELECT_ITEM_CLASS}>
                    {phaseLabels[phase]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ControlBlock>
        </div>

        <ControlBlock
          icon={<ToggleRight className="h-4 w-4" />}
          title="Visibilidade de módulos"
          subtitle="Feed · Nomeações · Categorias · Amigos · Pendentes"
          action={
            <Badge className="border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.9)] text-[var(--bg-paper)] shadow-none">
              {visibleCount}/{moduleCount}
            </Badge>
          }
        >
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {quickModuleItems.map((item) => (
                <VisibilityTile
                  key={item.key}
                  id={`quick-visibility-${item.key}`}
                  checked={item.checked}
                  label={item.label}
                  pending={visibilitySavingKey === item.key}
                  onChange={(checked) => onToggleQuickModule(item, checked)}
                />
              ))}
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <QuickMetric label="Pendentes" value={String(pendingCount)} />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`min-h-[58px] ${OUTLINE_BUTTON_CLASS}`}
                onClick={onOpenAdvanced}
              >
                Mais controlos
              </Button>
            </div>
          </div>
        </ControlBlock>
      </CardContent>
    </Card>
  );
}

function AdminSettingsAdvancedSheet({
  advancedModuleItems,
  allDisabled,
  allEnabled,
  feedback,
  onOpenChange,
  onSetAllModules,
  onSetNominationsVisible,
  onSetResultsVisible,
  onToggleAdvancedModule,
  open,
  state,
  visibilitySavingKey,
}: Readonly<AdvancedSheetProps>) {
  const allModulesSaving =
    visibilitySavingKey === "all-enabled" || visibilitySavingKey === "all-disabled";

  return (
    <AdminDetailSheet
      open={open}
      onOpenChange={onOpenChange}
      kicker="Operacional"
      title="Controlos avançados"
      description="Ajustes secundários isolados do painel principal."
    >
      {open ? (
        <>
          <FeedbackNotice feedback={feedback} />

          <ControlBlock
            icon={<ToggleRight className="h-4 w-4" />}
            title="Exposição pública"
            subtitle="Feedback visível e imediato para o grupo."
          >
            <div className="space-y-2">
              <VisibilityRow
                id="advanced-nominations-visible"
                checked={state.nominationsVisible}
                label="Nomeações"
                pending={visibilitySavingKey === "nominations"}
                onChange={onSetNominationsVisible}
              />
              <VisibilityRow
                id="advanced-results-visible"
                checked={state.resultsVisible}
                label="Resultados"
                pending={visibilitySavingKey === "results"}
                onChange={onSetResultsVisible}
              />
            </div>
          </ControlBlock>

          <ControlBlock
            icon={<ToggleRight className="h-4 w-4" />}
            title="Módulos secundários"
            subtitle="Wishlist · Votação · Stickers · Medidas · Gala"
            action={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={OUTLINE_BUTTON_CLASS}
                  disabled={allEnabled || allModulesSaving}
                  onClick={() => onSetAllModules(true)}
                >
                  Todos on
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={OUTLINE_BUTTON_CLASS}
                  disabled={allDisabled || allModulesSaving}
                  onClick={() => onSetAllModules(false)}
                >
                  Todos off
                </Button>
              </div>
            }
          >
            <div className="space-y-2">
              {advancedModuleItems.map((item) => (
                <VisibilityRow
                  key={item.key}
                  id={`advanced-visibility-${item.key}`}
                  checked={item.checked}
                  label={item.label}
                  pending={visibilitySavingKey === item.key}
                  onChange={(checked) => onToggleAdvancedModule(item, checked)}
                />
              ))}
            </div>
          </ControlBlock>
        </>
      ) : null}
    </AdminDetailSheet>
  );
}
