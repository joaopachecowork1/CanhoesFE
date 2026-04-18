"use client";

import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ImageOff, Upload } from "lucide-react";

import type { NomineeDto } from "@/lib/api/types";
import { getPhaseLabel } from "@/lib/canhoesEvent";
import { absMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";

export function formatEventPhaseLabel(phaseType?: string | null) {
  return getPhaseLabel(phaseType);
}

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

type CanhoesMediaThumbProps = {
  alt: string;
  frameClassName?: string;
  iconClassName?: string;
  imageClassName?: string;
  normalizeSrc?: boolean;
  src?: string | null;
};

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

type CanhoesFileTriggerProps = {
  accept?: string;
  className?: string;
  fileName?: string | null;
  iconClassName?: string;
  onChange: (file: File | null) => void;
  placeholder: string;
};

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
