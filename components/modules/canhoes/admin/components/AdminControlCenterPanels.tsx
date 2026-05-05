"use client";

import { type ReactNode } from "react";
import { ChevronRight, Layers, Settings2, Timer, ToggleRight } from "lucide-react";

import type { EventAdminStateDto, EventPhaseDto } from "@/lib/api/types";
import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
} from "./adminContentUi";
import { AdminDrawer } from "./AdminDrawer";
import type { SettingsFeedbackState } from "../hooks/useAdminControlCenter";

type FeedbackTone = "default" | "error" | "success";

const SELECT_TRIGGER_CLASS = ADMIN_SELECT_TRIGGER_CLASS;
const SELECT_CONTENT_CLASS = ADMIN_SELECT_CONTENT_CLASS;
const SELECT_ITEM_CLASS = ADMIN_SELECT_ITEM_CLASS;
const OUTLINE_BUTTON_CLASS = ADMIN_OUTLINE_BUTTON_CLASS;

const CONTROL_BLOCK_CLASS =
  "rounded-xl border border-[var(--border-paper)] bg-[var(--bg-paper)] p-3 shadow-[var(--shadow-paper)] sm:rounded-[var(--radius-md-token)]";

const CONTROL_ROW_CLASS =
  "flex items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] min-h-11 px-3 py-2 text-[var(--ink-primary)]";

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
      ? "border-[rgba(224,90,58,0.22)] bg-[rgba(255,243,239,0.96)] text-[var(--ink-primary)]"
      : feedback.tone === "success"
      ? "border-[rgba(76,175,80,0.2)] bg-[rgba(244,252,245,0.96)] text-[var(--ink-primary)]"
      : "border-[var(--border-paper)] bg-[var(--bg-paper-soft)] text-[var(--ink-secondary)]";

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
            <span className="text-[var(--moss)]">{icon}</span>
            <p className="text-[13px] font-semibold">{title}</p>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-[var(--ink-secondary)]">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

function VisibilityTile({ checked, id, label, onChange, pending }: Readonly<VisibilityTileProps>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-3 py-2.5 shadow-none">
      <div className="flex items-start justify-between gap-2">
        <Label htmlFor={id} className="min-w-0 cursor-pointer text-[13px] font-medium text-[var(--ink-primary)]">{label}</Label>
        <Switch id={id} checked={checked} disabled={pending} onCheckedChange={onChange} />
      </div>

      <p className="mt-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-secondary)]">{pending ? "A guardar" : checked ? "Ativo" : "Oculto"}</p>
    </div>
  );
}

function VisibilityRow({ checked, id, label, onChange, pending }: Readonly<VisibilityRowProps>) {
  return (
    <div className={cn(CONTROL_ROW_CLASS, checked && "border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.08)]")}>
      <div className="min-w-0">
        <Label htmlFor={id} className={cn("cursor-pointer text-sm font-medium", checked ? "text-[var(--ink-primary)]" : "text-[var(--ink-secondary)]")}>{label}</Label>
      </div>

      <div className="flex items-center gap-2">
        {pending ? <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-secondary)]">A guardar</span> : null}
        <Switch id={id} checked={checked} disabled={pending} onCheckedChange={onChange} variant="admin" />
      </div>
    </div>
  );
}

function QuickMetric({ label, value }: Readonly<QuickMetricProps>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-3 py-2 shadow-none">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-secondary)]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--ink-primary)]" title={value}>{value}</p>
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
            <div className="flex items-center gap-2">
              <p className="editorial-kicker text-[var(--neon-green)]">Operacional</p>
              <Badge className="border-[var(--border-paper)] bg-[rgba(122,173,58,0.1)] text-[var(--ink-primary)] shadow-none">
                {visibleCount}/{moduleCount}
              </Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[var(--neon-green)]" />
              Evento
            </CardTitle>
          </div>

          <Button type="button" size="sm" variant="outline" className={`gap-1.5 px-3 ${OUTLINE_BUTTON_CLASS}`} onClick={onOpenAdvanced}>
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
            <Select value={eventId ?? ""} onValueChange={onActivateEvent} disabled={savingKey === "event" || events.length === 0}>
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
            <Select value={state.activePhase?.type ?? ""} onValueChange={(value) => onUpdatePhase(value as EventPhaseDto["type"])} disabled={savingKey === "phase" || loading}>
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
            <Badge className="border-[rgba(122,173,58,0.18)] bg-[rgba(122,173,58,0.12)] text-[var(--ink-primary)] shadow-none">
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
    <AdminDrawer
      open={open}
      onOpenChange={onOpenChange}
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
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button type="button" size="sm" variant="outline" className={OUTLINE_BUTTON_CLASS} disabled={allEnabled || allModulesSaving} onClick={() => onSetAllModules(true)}>
                  Todos on
                </Button>
                <Button type="button" size="sm" variant="outline" className={OUTLINE_BUTTON_CLASS} disabled={allDisabled || allModulesSaving} onClick={() => onSetAllModules(false)}>
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
    </AdminDrawer>
  );
}
