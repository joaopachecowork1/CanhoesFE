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

export const ADMIN_CONTENT_CARD_CLASS =
  "border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]";

export const ADMIN_CONTENT_DETAIL_PANEL_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] px-4 py-3";

const ADMIN_CONTENT_LIST_PANEL_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] p-2";

const ADMIN_CONTENT_LIST_BODY_CLASS = "max-h-[58svh] space-y-1 overflow-y-auto pr-1";

const ADMIN_CONTENT_ROW_CLASS =
  "w-full rounded-[var(--radius-md-token)] border px-3 py-2.5 text-left transition-colors";

const ADMIN_CONTENT_ROW_ACTIVE_CLASS =
  "border-[rgba(122,173,58,0.36)] bg-[rgba(36,49,23,0.9)]";

const ADMIN_CONTENT_ROW_IDLE_CLASS =
  "border-[rgba(212,184,150,0.12)] bg-[rgba(18,24,11,0.62)] hover:bg-[rgba(24,31,16,0.82)]";

const ADMIN_CONTENT_SHEET_CLASS = "w-full sm:max-w-xl";
const ADMIN_CONTENT_SHEET_HEADER_CLASS =
  "border-b border-[rgba(212,184,150,0.14)] pb-4";
const ADMIN_CONTENT_SHEET_BODY_CLASS = "flex-1 space-y-5 overflow-y-auto px-4 pb-6";

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
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <div className={cn(ADMIN_CONTENT_SHEET_BODY_CLASS, bodyClassName)}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
