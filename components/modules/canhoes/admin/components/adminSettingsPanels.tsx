"use client";

import { ChevronRight, Layers, Settings2, Timer, ToggleRight } from "lucide-react";

import type {
  EventAdminStateDto,
  EventPhaseDto,
} from "@/lib/api/types";
import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ADMIN_CONTENT_CARD_CLASS, AdminDetailSheet } from "./adminContentUi";
import {
  ControlBlock,
  FeedbackNotice,
  OUTLINE_BUTTON_CLASS,
  QuickMetric,
  SELECT_CONTENT_CLASS,
  SELECT_TRIGGER_CLASS,
  VisibilityRow,
  VisibilityTile,
  type FeedbackTone,
} from "./adminSettingsUi";

export type SettingsFeedbackState = {
  message: string;
  tone: FeedbackTone;
};

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

export function AdminSettingsMainPanel({
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
                  <SelectItem key={event.id} value={event.id} className="text-[var(--bg-paper)]">
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
                  <SelectItem key={phase} value={phase} className="text-[var(--bg-paper)]">
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

export function AdminSettingsAdvancedSheet({
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
