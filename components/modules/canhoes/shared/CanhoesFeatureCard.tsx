"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanhoesDecorativeDivider } from "@/components/ui/canhoes-bits";

type CanhoesFeatureCardProps = {
  children: ReactNode;
  className?: string;
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
  className,
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
        className,
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
