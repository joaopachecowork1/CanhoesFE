import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  badge?: {
    label: string;
    variant?: "default" | "success" | "warning" | "purple";
  };
  description?: string;
  icon?: LucideIcon;
  kicker?: string;
  title: string;
  className?: string;
};

export function SectionHeader({
  badge,
  description,
  icon: Icon,
  kicker,
  title,
  className,
}: Readonly<SectionHeaderProps>) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-[var(--neon-green)]" />}
        {kicker && (
          <p className="editorial-kicker text-[var(--neon-green)]">{kicker}</p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-[var(--bg-paper)]">{title}</h2>

      {description && (
        <p className="text-sm leading-6 text-[rgba(245,237,224,0.78)]">
          {description}
        </p>
      )}

      {badge && (
        <Badge
          className={cn(
            "mt-2 shadow-none",
            badge.variant === "success" &&
              "border-[rgba(122,173,58,0.35)] bg-[rgba(45,68,24,0.92)] text-[var(--bg-paper)]",
            badge.variant === "warning" &&
              "border-[rgba(255,184,0,0.35)] bg-[rgba(255,184,0,0.16)] text-[var(--bg-paper)]",
            badge.variant === "purple" &&
              "border-[rgba(177,140,255,0.28)] bg-[rgba(177,140,255,0.16)] text-[var(--bg-paper)]",
            badge.variant === "default" &&
              "border-[rgba(212,184,150,0.18)] bg-[rgba(16,20,11,0.88)] text-[var(--bg-paper)]"
          )}
        >
          {badge.label}
        </Badge>
      )}
    </div>
  );
}
