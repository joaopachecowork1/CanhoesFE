"use client";

import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ImageOff, Upload } from "lucide-react";

import type { NomineeDto } from "@/lib/api/types";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { absMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanhoesDecorativeDivider } from "@/components/ui/canhoes-bits";

/**
 * Formata o label de uma fase do evento.
 * 
 * @param phaseType - O tipo da fase (ex: PROPOSALS, VOTING).
 */
export function formatEventPhaseLabel(phaseType?: string | null) {
  return getPhaseLabel(phaseType);
}

/**
 * Retorna a variante de Badge adequada para o estado de um nominee.
 */
export function getNomineeStatusBadgeVariant(status: NomineeDto["status"]) {
  if (status === "approved") return "secondary" as const;
  if (status === "rejected") return "destructive" as const;
  return "outline" as const;
}

type CanhoesModuleHeaderProps = {
  badgeLabel?: ReactNode;
  badgeVariant?: ComponentProps<typeof Badge>["variant"];
  description: string;
  icon: LucideIcon;
  title: string;
};

/**
 * Cabeçalho padrão para módulos do evento Canhões.
 * Inclui ícone, título, descrição e uma badge opcional de estado.
 */
export function CanhoesModuleHeader({
  badgeLabel,
  badgeVariant = "outline",
  description,
  icon: Icon,
  title,
}: Readonly<CanhoesModuleHeaderProps>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="canhoes-section-title flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--color-fire)]" />
          {title}
        </h1>
        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </div>

      {badgeLabel ? <Badge variant={badgeVariant}>{badgeLabel}</Badge> : null}
    </div>
  );
}

/**
 * Miniatura de media (imagem ou ícone de fallback).
 */
export function CanhoesMediaThumb({
  alt,
  frameClassName,
  iconClassName,
  imageClassName,
  normalizeSrc = true,
  src,
}: Readonly<CanhoesMediaThumbProps>) {
  const resolvedSrc = src ? (normalizeSrc ? absMediaUrl(src) : src) : null;

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5",
        frameClassName
      )}
    >
      {resolvedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
          decoding="async"
          sizes="56px"
        />
      ) : (
        <ImageOff
          className={cn("h-4 w-4 text-[var(--color-text-muted)]", iconClassName)}
        />
      )}
    </div>
  );
}

/**
 * Trigger para upload de ficheiros com estilo Canhões.
 */
export function CanhoesFileTrigger({
  accept = "image/*",
  className,
  fileName,
  iconClassName,
  onChange,
  placeholder,
}: Readonly<CanhoesFileTriggerProps>) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-moss)]/20 px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]",
        className
      )}
    >
      <Upload className={cn("h-4 w-4 text-[var(--color-beige)]", iconClassName)} />
      <span className="truncate">{fileName ?? placeholder}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

type CanhoesFeatureCardProps = {
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  headerAction?: ReactNode;
  icon?: LucideIcon;
  title: string;
  variant?: "default" | "official";
};

/**
 * Card base para funcionalidades dos módulos.
 * Unifica o estilo visual de "official voting", "nominations", etc.
 * 
 * @param children - Conteúdo principal do card.
 * @param description - Descrição opcional no cabeçalho.
 * @param footer - Conteúdo opcional de rodapé.
 * @param headerAction - Ação opcional no canto superior direito.
 * @param icon - Ícone opcional ao lado do título.
 * @param title - Título do card.
 * @param variant - Variante visual ("default" ou "official" com brilho).
 */
export function CanhoesFeatureCard({
  children,
  description,
  footer,
  headerAction,
  icon: Icon,
  title,
  variant = "default",
}: Readonly<CanhoesFeatureCardProps>) {
  return (
    <Card
      className={cn(
        "rounded-2xl transition-colors",
        variant === "default" && "border-[var(--border-paper)] bg-[var(--bg-paper)] text-[var(--ink-primary)]",
        variant === "official" && "canhoes-bits-panel canhoes-bits-panel--official"
      )}
    >
      <CardHeader className={cn("pb-2", variant === "official" && "space-y-1 pb-3")}>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className={cn("flex items-center gap-2", variant === "default" && "text-[var(--ink-primary)]", variant === "official" && "text-[var(--text-primary)]")}>
            {Icon && <Icon className={cn("h-4 w-4", variant === "default" ? "text-[var(--bark)]" : "text-[var(--neon-green)]")} />}
            {title}
          </CardTitle>
          {headerAction}
        </div>
        {description ? (
          <p className={cn("text-sm", variant === "default" ? "text-[var(--ink-secondary)]" : "text-[var(--text-muted)]")}>
            {description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        <CanhoesDecorativeDivider tone="moss" />
        {children}
      </CardContent>

      {footer ? (
        <div className="px-6 pb-6 pt-0">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
