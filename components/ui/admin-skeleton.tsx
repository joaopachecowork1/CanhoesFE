import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "heading" | "button" | "card" | "list-item" | "avatar";

const VARIANT_STYLES: Record<SkeletonVariant, string> = {
  text: "h-3.5 w-full rounded",
  heading: "h-5 w-2/3 rounded",
  button: "h-9 w-24 rounded-md",
  card: "h-32 w-full rounded-lg",
  "list-item": "h-12 w-full rounded",
  avatar: "h-8 w-8 rounded-full",
};

type AdminSkeletonProps = {
  count?: number;
  variant?: SkeletonVariant;
  className?: string;
};

/**
 * Skeleton loading placeholder for admin sections.
 * Uses a shimmer animation to indicate loading state.
 *
 * @example
 * ```tsx
 * <AdminSkeleton variant="card" count={3} />
 * <AdminSkeleton variant="heading" />
 * <AdminSkeleton variant="list-item" count={5} />
 * ```
 */
export function AdminSkeleton({
  count = 1,
  variant = "text",
  className,
}: Readonly<AdminSkeletonProps>) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gradient-to-r from-[rgba(212,184,150,0.08)] via-[rgba(212,184,150,0.16)] to-[rgba(212,184,150,0.08)] bg-[length:200%_100%]",
            "rounded-[var(--radius-md-token)]",
            VARIANT_STYLES[variant],
            className
          )}
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            animationDelay: `${i * 75}ms`,
          }}
        />
      ))}
    </>
  );
}

type AdminSectionSkeletonProps = {
  /** Number of skeleton rows to show */
  rows?: number;
  /** Show a heading skeleton at the top */
  showHeader?: boolean;
  /** Show filter skeletons (buttons/selects) */
  showFilters?: boolean;
  className?: string;
};

/**
 * Full section skeleton — simulates an entire admin panel section
 * with header, filters, and content rows.
 */
export function AdminSectionSkeleton({
  rows = 5,
  showHeader = true,
  showFilters = false,
  className,
}: Readonly<AdminSectionSkeletonProps>) {
  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="space-y-2">
          <AdminSkeleton variant="heading" className="w-1/2" />
          <AdminSkeleton variant="text" className="w-3/4" />
        </div>
      )}

      {showFilters && (
        <div className="flex gap-2">
          <AdminSkeleton variant="button" count={3} />
        </div>
      )}

      <div className="space-y-1">
        <AdminSkeleton variant="list-item" count={rows} />
      </div>
    </div>
  );
}
