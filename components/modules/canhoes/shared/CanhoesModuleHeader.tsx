"use client";

import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

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
