"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-[0_2px_4px_rgba(0,0,0,0.24)] transition-[box-shadow,background-color,transform] duration-300 ease-out outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:shadow-[0_2px_8px_rgba(177,140,255,0.32),inset_0_1px_0_1px_rgba(255,255,255,0.08)] data-[state=checked]:backdrop-blur-[2px] data-[state=checked]:before:absolute data-[state=checked]:before:inset-0 data-[state=checked]:before:bg-[radial-gradient(circle_at_top_left,rgba(177,140,255,0.12),transparent_35%)] data-[state=unchecked]:before:opacity-0 data-[state=unchecked]:before:content-[''] data-[state=unchecked]:before:absolute data-[state=unchecked]:before:inset-0 data-[state=unchecked]:before:bg-[radial-gradient(circle_at_bottom_right,rgba(36,25,20,0.1),transparent_45%)]",
        className
      )}
      style={{ willChange: "box-shadow,background-color" }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.28),inset_0_0_1px_rgba(255,255,255,0.12)] ring-0 transition-transform duration-200 ease-out will-change-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-[linear-gradient(180deg,rgba(36,46,21,0.98),rgba(22,28,14,0.96))] data-[state=checked]:shadow-[inset_0_1px_2px_rgba(0,0,0,0.36),0_0_15px_rgba(177,140,255,0.14)] data-[state=unchecked]:bg-[linear-gradient(180deg,rgba(12,16,8,0.96),rgba(11,14,8,0.98))] data-[state=unchecked]:shadow-[inset_0_2px_4px_rgba(0,0,0,0.42)]",
          className
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
