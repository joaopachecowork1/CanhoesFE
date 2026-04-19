import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md-token)] text-sm font-medium transition-[box-shadow,transform,background-color,border-color,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-paper)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--bg-paper)] shadow-sm hover:border-[var(--border-neon)] hover:shadow-md active:scale-[0.98]",
        destructive:
          "border border-[rgba(224,90,58,0.22)] bg-[linear-gradient(180deg,var(--color-danger),var(--color-danger-hover))] text-white shadow-sm hover:shadow-md hover:border-[rgba(224,90,58,0.32)] active:scale-[0.98]",
        outline:
          "border border-[var(--border-subtle)] bg-transparent text-[var(--bg-paper)] shadow-none hover:border-[var(--border-purple)] hover:bg-[rgba(245,237,224,0.06)] active:scale-[0.98]",
        secondary:
          "border border-[var(--border-subtle)] bg-[rgba(245,237,224,0.06)] text-[var(--bg-paper)] shadow-none hover:bg-[rgba(245,237,224,0.12)] active:scale-[0.98]",
        ghost:
          "border-transparent bg-transparent text-[var(--bg-paper)] shadow-none hover:bg-[rgba(245,237,224,0.12)] hover:text-[var(--accent-purple-soft)] active:scale-[0.98]",
        link:
          "px-0 text-[var(--accent-purple-soft)] underline-offset-4 shadow-none hover:text-[var(--bg-paper)] hover:underline decoration-[var(--border-purple)] decoration-2 hover:underline-offset-4",
        glow:
          "border border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--bg-paper)] shadow-[0_0_20px_rgba(0,255,136,0.04)] hover:shadow-[0_0_24px_rgba(0,255,136,0.1)] active:scale-[0.98]",
      },
      size: {
        default: "px-4 py-3 text-sm",
        sm: "min-h-11 rounded-[var(--radius-sm-token)] px-3 py-2 text-sm",
        lg: "min-h-12 rounded-[var(--radius-lg-token)] px-6 py-3 text-base",
        icon: "h-11 w-11 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
