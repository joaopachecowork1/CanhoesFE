"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
  variant?: "default" | "admin"
}) {
  const isAdmin = variant === "admin"

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-variant={variant}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent outline-none transition-[background-color,box-shadow,transform] duration-200 ease-out focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        isAdmin
          ? "data-[state=checked]:bg-[rgba(122,173,58,0.92)] data-[state=unchecked]:bg-[rgba(74,92,47,0.18)] data-[state=checked]:shadow-[0_0_0_1px_rgba(122,173,58,0.18),0_2px_8px_rgba(122,173,58,0.24)] data-[state=unchecked]:shadow-[inset_0_0_0_1px_rgba(74,92,47,0.18),0_1px_3px_rgba(0,0,0,0.12)]"
          : "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80 data-[state=checked]:shadow-[0_2px_8px_rgba(177,140,255,0.32),inset_0_1px_0_1px_rgba(255,255,255,0.08)] data-[state=checked]:backdrop-blur-[2px] data-[state=checked]:before:absolute data-[state=checked]:before:inset-0 data-[state=checked]:before:bg-[radial-gradient(circle_at_top_left,rgba(177,140,255,0.12),transparent_35%)] data-[state=unchecked]:before:opacity-0 data-[state=unchecked]:before:content-[''] data-[state=unchecked]:before:absolute data-[state=unchecked]:before:inset-0 data-[state=unchecked]:before:bg-[radial-gradient(circle_at_bottom_right,rgba(36,25,20,0.1),transparent_45%)]",
        className
      )}
      style={{ willChange: "box-shadow,background-color" }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full ring-0 transition-transform duration-200 ease-out will-change-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          isAdmin
            ? "bg-[linear-gradient(180deg,rgba(247,248,242,0.98),rgba(220,227,208,0.96))] shadow-[inset_0_1px_2px_rgba(0,0,0,0.18),0_0_10px_rgba(122,173,58,0.12)] data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            : "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground shadow-[inset_0_1px_3px_rgba(0,0,0,0.28),inset_0_0_1px_rgba(255,255,255,0.12)] data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-[linear-gradient(180deg,rgba(36,46,21,0.98),rgba(22,28,14,0.96))] data-[state=checked]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.36),0_0_15px_rgba(177,140,255,0.14)] data-[state=unchecked]:bg-[linear-gradient(180deg,rgba(12,16,8,0.96),rgba(11,14,8,0.98))] data-[state=unchecked]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.42)]",
          className
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
