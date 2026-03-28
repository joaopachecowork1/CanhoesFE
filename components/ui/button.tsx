import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "canhoes-tap inline-flex min-h-11 items-center justify-center gap-2 border text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neon-green)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "chamfer bg-[var(--moss)] text-[var(--text-primary)] border-[var(--moss-light)] font-[var(--font-mono)] uppercase tracking-[0.18em] shadow-[var(--glow-moss)] hover:bg-[var(--moss-light)] hover:[box-shadow:var(--glow-moss)] active:scale-[0.97]",
        destructive:
          "rounded-[var(--radius-sm-token)] border-transparent bg-[var(--danger)] text-white font-[var(--font-mono)] uppercase tracking-[0.14em] shadow-[0_10px_24px_rgba(224,90,58,0.28)] hover:brightness-95 active:scale-[0.97]",
        outline:
          "chamfer border-[var(--neon-green)] bg-transparent text-[var(--neon-green)] font-[var(--font-mono)] uppercase tracking-[0.18em] shadow-none hover:bg-[var(--neon-green)] hover:text-[var(--bg-void)] hover:[box-shadow:var(--glow-green)] active:scale-[0.97]",
        secondary:
          "chamfer border-[var(--bark)] bg-[var(--bark-dark)] text-[var(--text-primary)] font-[var(--font-mono)] uppercase tracking-[0.18em] shadow-[0_12px_24px_rgba(61,43,24,0.28)] hover:bg-[var(--bark)] active:scale-[0.97]",
        ghost:
          "rounded-[var(--radius-md-token)] border-[var(--border-subtle)] bg-[rgba(245,237,224,0.08)] text-[var(--text-primary)] shadow-none hover:border-[var(--border-neon)] hover:bg-[rgba(0,255,136,0.08)] hover:text-[var(--neon-green)] active:scale-[0.97]",
        link:
          "h-auto min-h-0 border-transparent px-0 py-0 font-[var(--font-mono)] text-[var(--neon-green)] uppercase tracking-[0.14em] shadow-none hover:text-[var(--neon-cyan)] hover:underline underline-offset-4",
      },
      size: {
        default: "px-4 py-3",
        sm: "min-h-11 px-3 py-2 text-sm",
        lg: "min-h-12 px-6 py-3 text-base",
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
