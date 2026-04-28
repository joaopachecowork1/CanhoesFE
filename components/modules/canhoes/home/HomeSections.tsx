"use client";

import { memo } from "react";
import { Clock3, Loader2, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CanhoesHeroEmblem as HeroEmblemIcon } from "@/components/chrome/canhoes/CanhoesHeroEmblem";
import { homeCopy as homeCopyText } from "@/lib/canhoesCopy";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";
import { ActionButton } from "./HomeActions";
import { MetricCard } from "./HomeCards";
import type { MetricItem } from "./HomeCards";

const HERO_CARD_CLASS =
  "relative overflow-hidden rounded-[var(--radius-xl-token)] border border-[rgba(212,184,150,0.12)] bg-[radial-gradient(circle_at_top_right,rgba(95,123,56,0.18),transparent_40%),linear-gradient(180deg,rgba(24,31,15,0.98),rgba(12,16,9,1))] text-[var(--text-primary)] shadow-[var(--shadow-elevation-lg)]";

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

export const CanhoesEventHomeErrorState = memo(function CanhoesEventHomeErrorState({ errorMessage }: Readonly<{ errorMessage?: string | null }>) {
  return (
    <Card className={HERO_CARD_CLASS}>
      <CardContent className="flex min-h-[12rem] items-center justify-center">
        <p className="text-sm text-[rgba(245,237,224,0.7)]">{errorMessage ?? "Erro ao carregar o evento"}</p>
      </CardContent>
    </Card>
  );
});

export const CanhoesEventHomeContent = memo(function CanhoesEventHomeContent({ viewModel }: Readonly<{ viewModel: CanhoesEventHomeViewModel }>) {
  const { event, homeCopy, overview, phaseDeadline, phaseLabel, phaseSummary } = viewModel;
  const metrics: MetricItem[] = [];

  return (
    <div className="space-y-6">
      <HomeHeroSection
        event={event}
        homeCopy={homeCopy}
        metrics={metrics}
        overview={overview}
        phaseDeadline={phaseDeadline}
        phaseLabel={phaseLabel}
        phaseSummary={phaseSummary}
      />
    </div>
  );
});

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
      <div className="relative z-10 space-y-6 px-4 py-6 sm:px-7 sm:py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--moss-light)] opacity-90">
              {event.name}
            </p>
            <h1 className="heading-1 text-white lg:text-5xl">
              {homeCopyText.heroTitle}
            </h1>
          </div>
          <HeroEmblemIcon compact className="mt-1 scale-110 sm:scale-125" />
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
