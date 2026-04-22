"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn("bg-[linear-gradient(90deg,rgba(212,184,150,0.12)_0%,rgba(177,140,255,0.08)_100%)] dark:bg-[linear-gradient(-90deg,rgba(212,184,150,0.14)_0%,rgba(177,140,255,0.06)_100%)] shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px data-[orientation=horizontal]:transition-all data-[orientation=horizontal]:duration-300 data-[orientation=horizontal]:before:absolute data-[orientation=horizontal]:before:left-0 data-[orientation=horizontal]:before:top-1/2 data-[orientation=horizontal]:before:-translate-y-1/2 data-[orientation=horizontal]:before:content-[''] data-[orientation=horizontal]:before:h-full data-[orientation=horizontal]:before:w-1 data-[orientation=horizontal]:before:bg-[linear-gradient(90deg,rgba(212,184,150,0.16),rgba(177,140,255,0.12))] data-[orientation=horizontal]:data-[state=active]:before:animate-pulse data-[orientation=horizontal]:data-[state=active]:before:duration-500", className)}
      style={{ willChange: "opacity" }}
      {...props}
    />
  )
}

export { Separator }
