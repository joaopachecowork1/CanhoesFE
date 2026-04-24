import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva("button-base", {
  variants: {
    variant: {
      default: "border border-[rgba(95,123,56,0.36)] bg-[var(--moss)] text-white shadow-[var(--shadow-elevation-sm)] hover:bg-[var(--moss-light)] hover:border-[rgba(95,123,56,0.48)] active:scale-[0.98]",
      primary: "button-pill button-pill-primary",
      destructive: "border border-[rgba(224,90,58,0.22)] bg-[linear-gradient(180deg,var(--color-danger),var(--color-danger-hover))] text-white shadow-[var(--shadow-elevation-sm)] hover:border-[rgba(224,90,58,0.3)] active:scale-[0.98]",
      outline: "border border-[var(--border-paper)] bg-[rgba(245,234,216,0.78)] text-[var(--ink-primary)] shadow-none hover:bg-[var(--bg-paper-soft)] hover:border-[var(--border-moss)] active:scale-[0.98]",
      secondary: "border border-[var(--border-subtle)] bg-[rgba(244,234,216,0.08)] text-[var(--text-primary)] shadow-none hover:bg-[rgba(244,234,216,0.14)] hover:border-[rgba(212,184,150,0.18)] active:scale-[0.98]",
      ghost: "border-transparent bg-transparent text-[var(--text-primary)] shadow-none hover:bg-[rgba(244,234,216,0.08)] hover:text-[var(--moss)] active:scale-[0.98]",
      link: "px-0 text-[var(--moss)] underline-offset-4 shadow-none hover:text-[var(--ink-primary)] hover:underline decoration-[rgba(95,123,56,0.3)] decoration-2 hover:underline-offset-4",
      glow: "border border-[rgba(95,123,56,0.22)] bg-[rgba(95,123,56,0.12)] text-[var(--text-primary)] shadow-[var(--shadow-elevation-sm)] hover:bg-[rgba(95,123,56,0.16)] active:scale-[0.98]",
    },
    size: {
      default: "px-4 py-3 text-sm",
      sm: "min-h-10 rounded-[var(--radius-sm-token)] px-3 py-2 text-sm",
      lg: "min-h-11 rounded-[var(--radius-lg-token)] px-5 py-3 text-base",
      icon: "h-10 w-10 p-0 flex items-center justify-center rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : motion.button;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
