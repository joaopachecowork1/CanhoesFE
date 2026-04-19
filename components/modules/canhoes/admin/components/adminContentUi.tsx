"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const ADMIN_CONTENT_CARD_CLASS = "canhoes-paper-panel";

export const ADMIN_CONTENT_DETAIL_PANEL_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] px-4 py-3";

const ADMIN_CONTENT_LIST_PANEL_CLASS =
  "rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] p-2";

const ADMIN_CONTENT_LIST_BODY_CLASS = "max-h-[58svh] space-y-1 overflow-y-auto pr-1";

const ADMIN_CONTENT_ROW_CLASS =
  "w-full rounded-[var(--radius-md-token)] border px-3 py-2.5 text-left text-[var(--ink-primary)] transition-colors min-h-11";

const ADMIN_CONTENT_ROW_ACTIVE_CLASS =
  "border-[rgba(122,173,58,0.32)] bg-[rgba(122,173,58,0.12)]";

const ADMIN_CONTENT_ROW_IDLE_CLASS =
  "border-[var(--border-subtle)] bg-[var(--bg-paper)] hover:bg-[var(--bg-paper-soft)]";

const ADMIN_CONTENT_SHEET_CLASS = "canhoes-paper-panel w-full sm:max-w-xl";
const ADMIN_CONTENT_SHEET_HEADER_CLASS =
  "border-b border-[var(--border-subtle)] pb-4";
const ADMIN_CONTENT_SHEET_BODY_CLASS = "flex-1 space-y-4 overflow-y-auto px-4 pb-6";

export const ADMIN_OUTLINE_BUTTON_CLASS = "canhoes-admin-outline-button";

export const ADMIN_SELECT_TRIGGER_CLASS = "canhoes-admin-select-trigger";

export const ADMIN_SELECT_CONTENT_CLASS = "canhoes-admin-select-content";

export const ADMIN_SELECT_ITEM_CLASS = "canhoes-admin-select-item";

type AdminDetailSheetProps = {
  bodyClassName?: string;
  children: ReactNode;
  description?: ReactNode;
  kicker: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: ReactNode;
};

type AdminListPanelProps = {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
};

type AdminSelectableButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function AdminDetailPanel({
  children,
  className,
}: Readonly<{ children: ReactNode; className?: string }>) {
  return <div className={cn(ADMIN_CONTENT_DETAIL_PANEL_CLASS, className)}>{children}</div>;
}

export function AdminListPanel({
  bodyClassName,
  children,
  className,
}: Readonly<AdminListPanelProps>) {
  return (
    <div className={cn(ADMIN_CONTENT_LIST_PANEL_CLASS, className)}>
      <div className={cn(ADMIN_CONTENT_LIST_BODY_CLASS, bodyClassName)}>{children}</div>
    </div>
  );
}

export function AdminSelectableButton({
  children,
  className,
  selected = false,
  ...props
}: Readonly<AdminSelectableButtonProps>) {
  return (
    <button
      {...props}
      className={cn(
        ADMIN_CONTENT_ROW_CLASS,
        selected ? ADMIN_CONTENT_ROW_ACTIVE_CLASS : ADMIN_CONTENT_ROW_IDLE_CLASS,
        className
      )}
    >
      {children}
    </button>
  );
}

export function AdminDetailSheet({
  bodyClassName,
  children,
  description,
  kicker,
  onOpenChange,
  open,
  title,
}: Readonly<AdminDetailSheetProps>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={ADMIN_CONTENT_SHEET_CLASS}>
        <SheetHeader className={ADMIN_CONTENT_SHEET_HEADER_CLASS}>
          <p className="editorial-kicker">{kicker}</p>
          <SheetTitle className="pr-8">{title}</SheetTitle>
          {description ? (
            <SheetDescription className="!text-[var(--ink-muted)]">
              {description}
            </SheetDescription>
          ) : null}
        </SheetHeader>

        <div className={cn(ADMIN_CONTENT_SHEET_BODY_CLASS, bodyClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
