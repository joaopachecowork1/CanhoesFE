"use client";

import type { ReactNode } from "react";

type AdminStateMessageProps = {
  action?: ReactNode;
  children: ReactNode;
  tone?: "default" | "error";
  variant?: "inline" | "panel";
};

export function AdminStateMessage({
  action,
  children,
  tone = "default",
  variant = "inline",
}: Readonly<AdminStateMessageProps>) {
  const toneClass =
    tone === "error"
      ? "border-[rgba(224,90,58,0.24)] bg-[rgba(30,18,12,0.9)] text-[rgba(255,236,231,0.92)]"
      : "border-[rgba(212,184,150,0.22)] bg-[rgba(18,23,12,0.72)] text-[rgba(245,237,224,0.72)]";

  if (variant === "panel") {
    return (
      <div
        className={`rounded-[var(--radius-md-token)] border border-dashed px-4 py-8 text-center body-small ${toneClass}`}
      >
        <div className="space-y-4">
          <div>{children}</div>
          {action ? <div className="flex justify-center">{action}</div> : null}
        </div>
      </div>
    );
  }

  return <div className="body-small text-[rgba(245,237,224,0.72)]">{children}</div>;
}
