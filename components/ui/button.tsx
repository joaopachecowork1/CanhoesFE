import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md-token)] font-[var(--font-body)] text-sm font-medium transition-[box-shadow,transform,background-color,border-color,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-paper)] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden border border-[rgba(212,184,150,0.24)] bg-[radial-gradient(105deg,at-30%_40%,rgba(122,173,58,0.22),rgba(20,25,12,0.88))] text-[var(--bg-paper)] shadow-[0_8px_24px_rgba(0,0,0,0.18),inset_0_1px_0_1px_rgba(255,255,255,0.08)] hover:-translate-y-[0.5px] hover:border-[rgba(0,255,136,0.28)] hover:bg-[radial-gradient(105deg,at-30%_40%,rgba(122,173,58,0.28),rgba(20,25,12,0.84))] hover:shadow-[0_12px_36px_rgba(0,0,0,0.22),0_0_36px_rgba(0,255,136,0.08),inset_0_1px_0_1px_rgba(255,255,255,0.12)] active:-translate-y-0 active:shadow-[0_6px_18px_rgba(0,0,0,0.14),inset_0_1px_0_1px_rgba(255,255,255,0.06)] before:absolute before:inset-0 before:z-0 before:bg-gradient-to-r before:from-[rgba(255,255,255,0.12)] before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 before:delay-100 before:group-hover:opacity-100 before:will-change-opacity",
        destructive:
          "border border-[rgba(224,90,58,0.22)] bg-[linear-gradient(180deg,var(--color-danger),var(--color-danger-hover))] text-white shadow-[0_6px_16px_rgba(224,90,58,0.16)] hover:-translate-y-[0.5px] hover:shadow-[0_10px_28px_rgba(224,90,58,0.2),inset_0_1px_0_1px_rgba(255,255,255,0.08)] hover:bg-[var(--color-danger-hover)] hover:border-[rgba(224,90,58,0.32)] active:-translate-y-0 active:shadow-[0_4px_12px_rgba(224,90,58,0.12)]",
        outline:
          "border border-[rgba(212,184,150,0.18)] bg-[radial-gradient(105deg,at-20%_35%,rgba(177,140,255,0.12),rgba(20,25,12,0.94))] text-[var(--bg-paper)] shadow-[0_6px_16px_rgba(0,0,0,0.12),inset_0_1px_0_1px_rgba(255,255,255,0.06)] hover:-translate-y-[0.5px] hover:border-[var(--border-purple)] hover:bg-[radial-gradient(105deg,at-20%_35%,rgba(177,140,255,0.18),rgba(20,25,12,0.92))] hover:shadow-[0_10px_28px_rgba(0,0,0,0.16),inset_0_1px_0_1px_rgba(255,255,255,0.1)] active:-translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        secondary:
          "border border-[rgba(212,184,150,0.18)] bg-[radial-gradient(105deg,at-20%_35%,rgba(0,255,136,0.08),rgba(24,30,15,0.92))] text-[var(--bg-paper)] shadow-[0_6px_16px_rgba(0,0,0,0.12),inset_0_1px_0_1px_rgba(255,255,255,0.06)] hover:-translate-y-[0.5px] hover:border-[var(--border-purple)] hover:bg-[radial-gradient(105deg,at-20%_35%,rgba(0,255,136,0.14),rgba(24,30,15,0.92))] hover:shadow-[0_10px_28px_rgba(0,0,0,0.16),inset_0_1px_0_1px_rgba(255,255,255,0.1)] active:-translate-y-0 active:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        ghost:
          "border-transparent bg-transparent text-[var(--bg-paper)] shadow-none hover:bg-[rgba(245,237,224,0.12)] hover:text-[var(--accent-purple-soft)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] active:scale-[0.98] active:bg-[rgba(245,237,224,0.18)] active:text-[var(--accent-purple)]",
        link:
          "px-0 text-[var(--accent-purple-soft)] underline-offset-4 shadow-none hover:text-[var(--bg-paper)] hover:underline decoration-[var(--border-purple)] decoration-2 hover:underline-offset-4",
        glow:
          "border border-[rgba(212,184,150,0.24)] bg-[radial-gradient(105deg,at-30%_40%,rgba(122,173,58,0.22),rgba(20,25,12,0.88))] text-[var(--bg-paper)] shadow-[0_0_40px_rgba(0,255,136,0.08)] hover:shadow-[0_0_55px_rgba(0,255,136,0.18)] hover:-translate-y-[0.5px] hover:shadow-[0_10px_35px_rgba(0,0,0,0.18),0_0_50px_rgba(0,255,136,0.14)] active:translate-y-0 active:shadow-[0_0_35px_rgba(0,255,136,0.08)]",
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
