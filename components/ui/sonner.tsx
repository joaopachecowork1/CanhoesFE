"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      expand={false}
      visibleToasts={4}
      className="toaster group"
      toastOptions={{
        classNames: {
          actionButton:
            "!bg-[var(--moss)] !text-[var(--text-primary)] !font-[var(--font-mono)] !uppercase !tracking-[0.14em]",
          cancelButton:
            "!bg-[var(--bg-paper-alt)] !text-[var(--text-dark)] !font-[var(--font-mono)] !uppercase !tracking-[0.12em]",
          closeButton:
            "!border-[var(--border-paper)] !bg-[var(--bg-paper)] !text-[var(--text-dark)]",
          description: "!text-[var(--text-muted)]",
          error:
            "!border-[var(--danger)]/25 !bg-[var(--bg-deep)] !text-[var(--text-primary)]",
          info:
            "!border-[var(--border-moss)] !bg-[var(--bg-deep)] !text-[var(--text-primary)]",
          loading:
            "!border-[var(--border-moss)] !bg-[var(--bg-deep)] !text-[var(--text-primary)]",
          success:
            "!border-[var(--border-neon)] !bg-[var(--bg-deep)] !text-[var(--text-primary)]",
          toast:
            "!rounded-[var(--radius-md-token)] !border !shadow-[var(--shadow-panel)]",
          warning:
            "!border-[var(--neon-amber)]/25 !bg-[var(--bg-deep)] !text-[var(--text-primary)]",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--bg-deep)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-moss)",
          "--border-radius": "var(--radius-md-token)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
