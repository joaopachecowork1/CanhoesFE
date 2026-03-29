"use client";

type AdminStateMessageProps = {
  children: React.ReactNode;
  variant?: "inline" | "panel";
};

export function AdminStateMessage({
  children,
  variant = "inline",
}: Readonly<AdminStateMessageProps>) {
  if (variant === "panel") {
    return (
      <div className="rounded-[var(--radius-md-token)] border border-dashed border-[var(--color-moss)]/20 bg-[var(--color-bg-surface)]/50 px-4 py-8 text-center body-small text-[var(--color-text-muted)]">
        {children}
      </div>
    );
  }

  return <div className="body-small text-[var(--color-text-muted)]">{children}</div>;
}
