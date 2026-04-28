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
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[90svh] flex-col rounded-t-[var(--radius-xl-token)] bg-[var(--bg-paper)] shadow-2xl ring-1 ring-[var(--border-paper)] focus:outline-none">
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-[var(--border-paper-strong)]" />
          
          <div className="flex items-start justify-between px-6 pt-5 pb-4">
            <div className="space-y-1">
              <Drawer.Title className="text-xl font-bold text-[var(--ink-primary)]">
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
          
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
