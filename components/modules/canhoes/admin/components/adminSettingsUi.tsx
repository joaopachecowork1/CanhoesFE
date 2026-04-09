"use client";

import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type FeedbackTone = "default" | "error" | "success";

export const SELECT_TRIGGER_CLASS =
  "border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)] data-[placeholder]:text-[rgba(245,237,224,0.56)] [&_svg:not([class*='text-'])]:text-[rgba(245,237,224,0.62)] focus-visible:bg-[rgba(18,23,12,0.92)]";

export const SELECT_CONTENT_CLASS =
  "border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.98)] text-[var(--bg-paper)]";

export const OUTLINE_BUTTON_CLASS =
  "border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)]";

const CONTROL_BLOCK_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] px-3 py-2.5";

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
      ? "border-[rgba(224,90,58,0.24)] bg-[rgba(30,18,12,0.9)] text-[rgba(255,236,231,0.92)]"
      : feedback.tone === "success"
      ? "border-[rgba(122,173,58,0.28)] bg-[rgba(20,28,14,0.9)] text-[rgba(245,255,236,0.92)]"
      : "border-[rgba(212,184,150,0.2)] bg-[rgba(18,23,12,0.78)] text-[rgba(245,237,224,0.82)]";

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
          <div className="flex items-center gap-2 text-[var(--bg-paper)]">
            <span className="text-[var(--neon-green)]">{icon}</span>
            <p className="text-[13px] font-semibold">{title}</p>
          </div>
          {subtitle ? (
            <p className="mt-0.5 text-[11px] text-[rgba(245,237,224,0.62)]">{subtitle}</p>
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
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,12,0.78)] px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <Label
          htmlFor={id}
          className="min-w-0 cursor-pointer text-[13px] font-medium text-[var(--bg-paper)]"
        >
          {label}
        </Label>
        <Switch id={id} checked={checked} disabled={pending} onCheckedChange={onChange} />
      </div>

      <p className="mt-1 font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(245,237,224,0.56)]">
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
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,12,0.78)] px-3 py-2.5">
      <div className="min-w-0">
        <Label
          htmlFor={id}
          className="cursor-pointer text-sm font-medium text-[var(--bg-paper)]"
        >
          {label}
        </Label>
      </div>

      <div className="flex items-center gap-2">
        {pending ? (
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(245,237,224,0.56)]">
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
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,23,12,0.78)] px-3 py-2">
      <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(245,237,224,0.58)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--bg-paper)]" title={value}>
        {value}
      </p>
    </div>
  );
}
