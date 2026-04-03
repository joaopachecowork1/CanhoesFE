"use client";

type Props = {
  kicker: string;
  title: string;
  count: number;
  defaultOpen?: boolean;
  children?: React.ReactNode;
};

export function AdminCollapsibleSection({
  kicker,
  title,
  count,
  children,
}: Readonly<Props>) {
  return (
    <div className="rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[linear-gradient(180deg,rgba(18,24,11,0.94),rgba(11,14,8,0.96))] px-4 py-4 text-[var(--bg-paper)] shadow-[var(--shadow-panel)] sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.68)]">
            {kicker}
          </p>
          <p className="font-semibold text-[var(--bg-paper)]">{title}</p>
          <p className="body-small text-[rgba(245,237,224,0.66)]">{count} itens</p>
        </div>
      </div>
      {children}
    </div>
  );
}
