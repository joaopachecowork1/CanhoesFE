import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard card styling for admin sections.
 * Unifies the repeated dark gradient + border pattern used across 10+ admin components.
 *
 * Usage:
 * ```tsx
 * <AdminCard>
 *   <CardHeader>...</CardHeader>
 *   <CardContent>...</CardContent>
 * </AdminCard>
 * ```
 */
export function AdminCard({ children, className }: AdminCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]",
        className
      )}
    >
      {children}
    </div>
  );
}
