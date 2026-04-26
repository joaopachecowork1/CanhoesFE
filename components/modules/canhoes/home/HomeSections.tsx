"use client";

import dynamic from "next/dynamic";
import { memo, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock3, Loader2, MessageSquare, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanhoesHeroEmblem } from "@/components/chrome/canhoes/CanhoesHeroEmblem";
import { ErrorAlert } from "@/components/ui/error-alert";
import { SectionBoundary } from "@/components/ui/section-boundary";
import { homeCopy as homeCopyText } from "@/lib/canhoesCopy";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";
import { ActionButton } from "./HomeActions";
import { MetricCard } from "./HomeCards";

const HomeFeedPanel = dynamic(() => import("./HomePanels").then(m => m.HomeFeedPanel), {
  loading: () => <div className="min-h-[200px] animate-pulse rounded-lg bg-[var(--bg-paper-soft)]" />
});

const HomeSecretSantaPanel = dynamic(() => import("./HomePanels").then(m => m.HomeSecretSantaPanel), {
  loading: () => <div className="min-h-[150px] animate-pulse rounded-lg bg-[var(--bg-paper-soft)]" />
});

const HomeChecklistPanel = dynamic(() => import("./HomePanels").then(m => m.HomeChecklistPanel), {
  loading: () => <div className="min-h-[150px] animate-pulse rounded-lg bg-[var(--bg-paper-soft)]" />
});

const CanhoesHeroEmblem = dynamic(() => import("@/components/chrome/canhoes/CanhoesHeroEmblem").then(m => m.CanhoesHeroEmblem), {
  ssr: true,
  loading: () => <div className="h-12 w-12 rounded-xl animate-pulse bg-white/10" />
});

const HERO_CARD_CLASS =
  "relative overflow-hidden rounded-[var(--radius-xl-token)] border border-[rgba(212,184,150,0.12)] bg-[radial-gradient(circle_at_top_right,rgba(95,123,56,0.18),transparent_40%),linear-gradient(180deg,rgba(24,31,15,0.98),rgba(12,16,9,1))] text-[var(--text-primary)] shadow-[var(--shadow-elevation-lg)] before:absolute before:inset-0 before:bg-[url('/noise.png')] before:opacity-[0.03] before:pointer-events-none";

const PANEL_CARD_CLASS =
  "rounded-[var(--radius-lg-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)] transition-all duration-300 ease-out";

// ... (rest of type definitions unchanged)

export const CanhoesEventHomeLoadingState = memo(function CanhoesEventHomeLoadingState() {
  return (
    <Card className={HERO_CARD_CLASS}>
      <CardContent className="flex min-h-[16rem] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-[rgba(245,237,224,0.9)]">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--moss)] opacity-80" />
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.25em] text-[var(--moss-light)]">
            {homeCopyText.loading}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});

// ...

const HomeHeroSection = memo(function HomeHeroSection({
  event,
  homeCopy,
  metrics,
  overview,
  phaseDeadline,
  phaseLabel,
  phaseSummary,
}: Readonly<{
  event: NonNullable<CanhoesEventHomeViewModel["event"]>;
  homeCopy: CanhoesEventHomeViewModel["homeCopy"];
  metrics: MetricItem[];
  overview: CanhoesEventHomeViewModel["overview"];
  phaseDeadline: string | null;
  phaseLabel: string;
  phaseSummary: string;
}>) {
  return (
    <section className={cn(HERO_CARD_CLASS, "editorial-shell transition-all duration-500 ease-in-out")}>
      <div className="relative z-10 space-y-6 px-5 py-7 sm:px-7 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--moss-light)] opacity-90">
              {event.name}
            </p>
            <h1 className="heading-1 text-white lg:text-5xl">
              {homeCopyText.heroTitle}
            </h1>
          </div>
          <CanhoesHeroEmblem compact className="mt-1 scale-110 sm:scale-125" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge className="border-[rgba(95,123,56,0.4)] bg-[rgba(95,123,56,0.25)] text-white px-4 py-1.5 shadow-[0_0_15px_rgba(95,123,56,0.2)] transition-all hover:scale-105">
            {phaseLabel}
          </Badge>
          {overview.nextPhase ? (
            <Badge variant="outline" className="border-[rgba(118,98,166,0.3)] bg-[rgba(118,98,166,0.12)] text-[var(--accent-purple-soft)] px-4 py-1.5 hover:bg-[rgba(118,98,166,0.2)]">
              Próxima: {getPhaseLabel(overview.nextPhase.type)}
            </Badge>
          ) : null}
        </div>

        <div className="space-y-3 max-w-2xl">
          <h2 className="font-[var(--font-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[rgba(245,237,224,0.6)]">
            Resumo da Fase
          </h2>
          <p className="body-base text-lg font-medium leading-relaxed text-[rgba(245,237,224,0.95)] selection:bg-[var(--moss)]">
            {phaseSummary}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 pt-2">
          {metrics.map((item) => (
            <MetricCard key={item.label} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap pt-2">
          {[homeCopy.primaryAction, homeCopy.secondaryAction].map((action, idx) => (
            <ActionButton 
              key={`${action.label}-${action.tone}`} 
              action={action} 
              className={cn(
                "min-w-[160px] shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95",
                idx === 0 ? "bg-[var(--moss)] hover:bg-[var(--moss-light)]" : "bg-white/5 hover:bg-white/10 backdrop-blur-sm"
              )}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5 border-t border-white/10 pt-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[rgba(245,237,224,0.5)]">
          <span className="inline-flex items-center gap-2.5 transition-colors hover:text-[rgba(245,237,224,0.8)]">
            <Clock3 className="h-3.5 w-3.5 text-[var(--sand)]" />
            {phaseDeadline ? `Fecha a ${phaseDeadline}` : "Sem data de fecho"}
          </span>
          <span className="inline-flex items-center gap-2.5 transition-colors hover:text-[rgba(245,237,224,0.8)]">
            <MessageSquare className="h-3.5 w-3.5 text-[var(--moss)]" />
            {overview.permissions.canManage ? homeCopyText.manageLabel : homeCopyText.memberLabel}
          </span>
        </div>
      </div>
    </section>
  );
});

const HomeAlertsSection = memo(function HomeAlertsSection({ alerts }: Readonly<{ alerts: AlertItem[] }>) {
  return (
    <HomePanel title={homeCopyText.alertsTitle} icon={Clock3} cardClassName="border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]">
      {alerts.map((alert) => (
        <div key={alert} className="rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper-soft)] px-3 py-3 text-sm text-[var(--ink-primary)]">
          {alert}
        </div>
      ))}
    </HomePanel>
  );
});

const HomePanel = memo(function HomePanel({
  cardClassName,
  children,
  footer,
  icon: Icon,
  title,
}: Readonly<{
  cardClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon: LucideIcon;
  title: string;
}>) {
  return (
    <Card className={cn(PANEL_CARD_CLASS, cardClassName)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-[var(--ink-primary)]">
          <Icon className="h-4 w-4 text-[var(--moss)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
        {footer}
      </CardContent>
    </Card>
  );
});
