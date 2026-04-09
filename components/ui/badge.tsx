import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1 font-[var(--font-mono)] text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(0,255,136,0.18)] bg-[linear-gradient(180deg,rgba(66,88,38,0.96),rgba(38,54,24,0.96))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm)]",
        secondary:
          "border-[rgba(212,184,150,0.2)] bg-[linear-gradient(180deg,rgba(30,38,20,0.96),rgba(22,28,14,0.96))] text-[var(--bg-paper)] shadow-[0_0_8px_rgba(212,184,150,0.06)]",
        destructive:
          "border-[rgba(224,90,58,0.22)] bg-[linear-gradient(180deg,var(--color-danger),var(--color-danger-hover))] text-white shadow-sm hover:opacity-90",
        outline:
          "border-[var(--border-purple)] bg-[rgba(177,140,255,0.08)] text-[var(--bg-paper)] shadow-[var(--glow-purple-sm)]",
        amber:
          "border-[rgba(255,184,0,0.3)] bg-[linear-gradient(180deg,rgba(255,184,0,0.12),rgba(255,184,0,0.06))] text-[var(--neon-amber)]",
        cyan:
          "border-[rgba(0,212,170,0.25)] bg-[rgba(0,212,170,0.08)] text-[var(--neon-cyan)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
