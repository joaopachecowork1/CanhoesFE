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
    <article className="relative overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] px-4 py-3.5 text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.12),transparent_32%)]" />
      <div className="relative space-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="heading-3 text-[var(--bg-paper)]">{title}</h3>
            {status}
          </div>
          {meta ? (
            <Badge
              variant="outline"
              className="w-fit text-[0.75rem] border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.72)] text-[rgba(245,237,224,0.72)] shadow-none"
            >
              {meta}
            </Badge>
          ) : null}
        </div>

        {children ? <div className="space-y-2.5">{children}</div> : null}

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[rgba(212,184,150,0.1)] sm:justify-end mt-2">
            {actions}
          </div>
        ) : null}
      </div>
    </article>
  );
}
