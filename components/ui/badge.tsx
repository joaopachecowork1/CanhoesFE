import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-8 items-center justify-center border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--neon-green)] focus:ring-offset-0 font-[var(--font-mono)]",
  {
    variants: {
      variant: {
        default:
          "rounded-full border-transparent bg-[var(--moss)] text-[var(--text-primary)] shadow-[var(--glow-moss)]",
        secondary:
          "rounded-full border-transparent bg-[var(--bark)] text-[var(--text-primary)] shadow-[0_10px_24px_rgba(61,43,24,0.2)]",
        destructive:
          "rounded-full border-transparent bg-[var(--danger)] text-white shadow-sm hover:opacity-90",
        outline:
          "chamfer border-[var(--neon-green)] bg-transparent text-[var(--neon-green)]",
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
