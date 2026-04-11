"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type FeedbackTone = "default" | "error" | "success";

export const SELECT_TRIGGER_CLASS =
  "border-[var(--border-subtle)] bg-[var(--bg-paper)] text-[var(--ink-primary)] data-[placeholder]:text-[var(--ink-muted)] [&_svg:not([class*='text-'])]:text-[var(--ink-muted)] focus-visible:bg-[var(--bg-paper-soft)]";

export const SELECT_CONTENT_CLASS =
  "border-[var(--border-subtle)] bg-[var(--bg-paper)] text-[var(--ink-primary)]";

export const OUTLINE_BUTTON_CLASS =
  "border-[var(--border-subtle)] bg-[var(--bg-paper)] text-[var(--ink-primary)] hover:bg-[var(--bg-paper-soft)]";

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

export function FeedbackNotice({ feedback }: Readonly<FeedbackNoticeProps>) {
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

export function ControlBlock({
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

export function VisibilityTile({
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

export function VisibilityRow({
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

export function QuickMetric({ label, value }: Readonly<QuickMetricProps>) {
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
