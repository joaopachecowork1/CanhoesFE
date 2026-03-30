"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "flex w-full items-center justify-start gap-2 rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[linear-gradient(180deg,rgba(15,18,9,0.9),rgba(10,13,8,0.96))] p-2 text-[var(--text-muted)] overflow-x-auto scrollbar-hide whitespace-nowrap shadow-[var(--shadow-panel)]",
  {
    variants: {
      variant: {
        default: "",
        line: "rounded-none border-x-0 border-t-0 border-b border-[var(--border-subtle)] bg-transparent px-0 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md-token)] border border-transparent px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] disabled:pointer-events-none disabled:opacity-50 flex-shrink-0 font-[var(--font-mono)] uppercase tracking-[0.12em]",
        "data-[state=active]:border-[var(--border-purple)] data-[state=active]:bg-[linear-gradient(180deg,rgba(245,237,224,0.16),rgba(177,140,255,0.1))] data-[state=active]:text-[var(--bg-paper)] data-[state=active]:shadow-[var(--glow-purple-sm)]",
        "hover:border-[rgba(212,184,150,0.18)] hover:bg-[rgba(245,237,224,0.08)] hover:text-[var(--bg-paper)]",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
