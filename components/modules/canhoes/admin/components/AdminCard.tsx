import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard card styling for admin sections.
 * Paper surface for readability — operational, compact, low-noise.
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
        "rounded-[var(--radius-lg-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] text-[var(--ink-primary)] shadow-[var(--shadow-paper)]",
        className
      )}
    >
      {children}
    </div>
  );
}
