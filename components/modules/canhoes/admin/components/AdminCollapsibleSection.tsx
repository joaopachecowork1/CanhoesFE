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
    <div className="canhoes-paper-panel rounded-[var(--radius-lg-token)] px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--bark)]/72">
            {kicker}
          </p>
          <p className="font-semibold text-[var(--text-ink)]">{title}</p>
          <p className="body-small text-[var(--bark)]/68">{count} itens</p>
        </div>
      </div>
      {children}
    </div>
  );
}
