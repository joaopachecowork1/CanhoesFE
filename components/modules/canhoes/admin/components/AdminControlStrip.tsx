"use client";

import { CalendarRange, RefreshCw, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminCopy } from "@/lib/canhoesCopy";

import {
  ADMIN_QUICK_ACTIONS,
  type AdminSectionId,
} from "../adminSections";

type AdminControlStripProps = {
  activeEventName: string | null;
  loading: boolean;
  memberCount: number;
  pendingReviewCount: number;
  phaseLabel: string;
  totalVotes: number;
  visibleCategoryCount: number;
  onRefresh: () => void;
  onSelectSection: (section: AdminSectionId) => void;
};

export function AdminControlStrip({
  activeEventName,
  loading,
  memberCount,
  pendingReviewCount,
  phaseLabel,
  totalVotes,
  visibleCategoryCount,
  onRefresh,
  onSelectSection,
}: Readonly<AdminControlStripProps>) {
  return (
    <section className="canhoes-paper-panel overflow-hidden rounded-[var(--radius-xl-token)] px-4 py-4 sm:px-5 sm:py-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-[var(--bark)]">
                <ShieldCheck className="h-4 w-4" />
                <span className="editorial-kicker text-[var(--bark)]">
                  {adminCopy.controlStrip.kicker}
                </span>
              </span>
              <Badge className="border-[rgba(107,76,42,0.18)] bg-[rgba(107,76,42,0.08)] text-[var(--bark)]">
                {phaseLabel}
              </Badge>
              <Badge
                variant={pendingReviewCount > 0 ? "secondary" : "outline"}
                className="border-[rgba(107,76,42,0.16)] text-[var(--bark)]"
              >
                {pendingReviewCount > 0
                  ? `${pendingReviewCount} por rever`
                  : adminCopy.controlStrip.clearQueue}
              </Badge>
            </div>

            <div className="space-y-1">
              <h2 className="heading-2 text-[var(--text-ink)]">
                {adminCopy.controlStrip.title}
              </h2>
              <p className="body-small max-w-2xl text-[var(--bark)]/76">
                {adminCopy.controlStrip.description}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="border-[rgba(107,76,42,0.15)] bg-[var(--bark-dark)] text-[var(--bg-paper)]"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {adminCopy.controlStrip.refresh}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StripMetric
            label={adminCopy.controlStrip.metrics.pending}
            value={pendingReviewCount}
            tone={pendingReviewCount > 0 ? "alert" : "default"}
          />
          <StripMetric
            label={adminCopy.controlStrip.metrics.categories}
            value={visibleCategoryCount}
          />
          <StripMetric
            label={adminCopy.controlStrip.metrics.members}
            value={memberCount}
          />
          <StripMetric
            label={adminCopy.controlStrip.metrics.votes}
            value={totalVotes}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ADMIN_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onSelectSection(action.id)}
                className={
                  action.tone === "primary"
                    ? "canhoes-paper-card canhoes-tap flex min-h-[88px] flex-col items-start justify-between rounded-[var(--radius-md-token)] border-[rgba(122,173,58,0.26)] bg-[linear-gradient(180deg,rgba(250,244,233,0.98),rgba(236,228,212,0.98))] px-3 py-3 text-left shadow-[var(--glow-green-sm)] transition-transform active:scale-[0.98]"
                    : "canhoes-paper-card canhoes-tap flex min-h-[88px] flex-col items-start justify-between rounded-[var(--radius-md-token)] px-3 py-3 text-left transition-transform active:scale-[0.98]"
                }
              >
                <span
                  className={
                    action.tone === "primary"
                      ? "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(122,173,58,0.22)] bg-[rgba(74,92,47,0.1)] text-[var(--moss)]"
                      : "flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(107,76,42,0.12)] bg-[rgba(107,76,42,0.06)] text-[var(--bark)]"
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-semibold text-[var(--text-ink)]">
                    {action.label}
                  </span>
                  <span className="block text-xs leading-5 text-[var(--bark)]/72">
                    {action.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[rgba(107,76,42,0.1)] pt-4 text-sm text-[var(--bark)]/72">
          <span className="inline-flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-[var(--moss)]" />
            {activeEventName ?? adminCopy.controlStrip.activeEventFallback}
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--moss)]" />
            {memberCount} {adminCopy.controlStrip.membersSummary}
          </span>
        </div>
      </div>
    </section>
  );
}

function StripMetric({
  label,
  tone = "default",
  value,
}: Readonly<{
  label: string;
  tone?: "alert" | "default";
  value: number;
}>) {
  return (
    <div
      className={
        tone === "alert"
          ? "rounded-[var(--radius-md-token)] border border-[rgba(122,173,58,0.22)] bg-[linear-gradient(180deg,rgba(245,237,224,0.92),rgba(234,220,193,0.86))] px-3 py-3 shadow-[var(--glow-green-xs)]"
          : "rounded-[var(--radius-md-token)] border border-[rgba(107,76,42,0.12)] bg-[rgba(248,240,226,0.72)] px-3 py-3"
      }
    >
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--bark)]/64">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[var(--text-ink)]">{value}</p>
    </div>
  );
}
