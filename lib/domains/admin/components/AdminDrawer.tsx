"use client";

import { Drawer } from "vaul";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function AdminDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}: Readonly<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
}>) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[80] bg-black/65 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[92svh] flex-col rounded-t-[var(--radius-xl-token)] bg-[var(--bg-paper)] shadow-2xl ring-1 ring-[var(--border-paper)] focus:outline-none sm:inset-y-4 sm:left-auto sm:right-4 sm:w-[min(30rem,calc(100vw-2rem))] sm:max-h-none sm:rounded-[var(--radius-xl-token)]">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[var(--border-paper-strong)] sm:hidden" />
          
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-paper)] px-4 pb-3 pt-4 sm:px-5">
            <div className="min-w-0 space-y-1">
              <Drawer.Title className="text-lg font-bold text-[var(--ink-primary)] sm:text-xl">
                {title}
              </Drawer.Title>
              {description && (
                <Drawer.Description className="text-sm text-[var(--ink-secondary)]">
                  {description}
                </Drawer.Description>
              )}
            </div>
            {onOpenChange && (
              <button 
                type="button" 
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 text-[var(--ink-muted)] hover:bg-[var(--bg-paper-soft)] hover:text-[var(--ink-primary)] transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-3 sm:px-5">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
