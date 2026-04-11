import { Badge } from "@/components/ui/badge";

/**
 * Reusable card component for proposal review pages.
 * Provides a consistent layout with title, meta, status, actions, and optional content slots.
 * Handles dark paper theme matching the app's aesthetic with subtle gradients.
 *
 * @example
 * ```tsx
 * <AdminReviewCard
 *   title="Nova Categoria"
 *   status={<Badge variant="primary">Nova</Badge>}
 *   meta="Criada: 5 min atrs"
 *   actions={<Button onClick={handleSave}>Salvar</Button>}
 * >
 *   <div>
 *     <Input label="Nome" value={name} onChange={handleNameChange} />
 *   </div>
 * </AdminReviewCard>
 * ```
 */
export function AdminReviewCard({
  actions,
  children,
  meta,
  status,
  title,
}: Readonly<{
  actions?: React.ReactNode;
  children?: React.ReactNode;
  meta?: string;
  status?: React.ReactNode;
  title: string;
}>) {
  return (
    <article className="relative overflow-hidden rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] px-4 py-3.5 text-[var(--ink-primary)] shadow-[var(--shadow-paper)]">
      <div className="relative space-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="heading-3 text-[var(--ink-primary)]">{title}</h3>
            {status}
          </div>
          {meta ? (
            <Badge
              variant="outline"
              className="w-fit text-[0.75rem] border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] text-[var(--ink-muted)] shadow-none"
            >
              {meta}
            </Badge>
          ) : null}
        </div>

        {children ? <div className="space-y-2.5">{children}</div> : null}

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-3 mt-2 sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}
