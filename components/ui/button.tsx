import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md-token)] border font-[var(--font-mono)] text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(212,184,150,0.22)] bg-[linear-gradient(180deg,var(--bark),var(--bark-dark))] text-[var(--bg-paper)] shadow-[var(--shadow-card)] hover:border-[rgba(0,255,136,0.18)] hover:[box-shadow:var(--glow-green-sm)] active:scale-[0.98]",
        destructive:
          "border-[rgba(224,90,58,0.22)] bg-[linear-gradient(180deg,var(--color-danger),var(--color-danger-hover))] text-white shadow-[var(--shadow-card)] hover:[box-shadow:0_0_18px_rgba(224,90,58,0.24)] active:scale-[0.98]",
        outline:
          "border-[rgba(212,184,150,0.16)] bg-[rgba(20,25,12,0.92)] text-[var(--bg-paper)] shadow-[var(--shadow-panel)] hover:border-[var(--border-purple)] hover:bg-[rgba(34,42,20,0.96)] hover:[box-shadow:var(--glow-purple-sm)] active:scale-[0.98]",
        secondary:
          "border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,var(--bg-paper-soft),var(--bg-paper-alt))] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)] hover:border-[var(--border-purple)] hover:bg-[linear-gradient(180deg,#faf4e9,var(--bg-paper-soft))] hover:[box-shadow:var(--glow-purple-sm)] active:scale-[0.98]",
        ghost:
          "border-transparent bg-transparent text-[var(--text-primary)] shadow-none hover:bg-[rgba(245,237,224,0.08)] hover:text-[var(--accent-purple-soft)] active:scale-[0.98]",
        link: "border-transparent px-0 text-[var(--accent-purple-soft)] underline-offset-4 shadow-none hover:text-[var(--bg-paper)] hover:underline",
      },
      size: {
        default: "px-4 py-3",
        sm: "min-h-11 rounded-[var(--radius-sm-token)] px-3 py-2 text-sm",
        lg: "min-h-12 rounded-[var(--radius-lg-token)] px-6 py-3 text-base",
        icon: "h-11 w-11 p-0",
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
