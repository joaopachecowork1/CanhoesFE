/**
 * Empty state component for no results.
 * Matches the dark paper theme with moose-inspired border colors.
 * Used when there are no items to display in a section.
 *
 * @param title - Main heading for the empty state
 * @param description - Subtitle explaining the empty state
 * @param action - Optional action button to resolve the empty state
 * @example
 * ```tsx
 * <EmptyContent
 *   title="Nenhuma proposta encontrada"
 *   description="Nenhuma proposta corresponde ao filtro atual."
 *   action={
 *     <Button onClick={handleClearFilters}>
 *       Limpar filtros
 *     </Button>
 *   }
 * />
 * ```
 */
export function EmptyContent({
  action,
  description,
  title,
}: Readonly<{
  action?: React.ReactNode;
  description: string;
  title: string;
}>) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-dashed border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.2)] p-8 text-center">
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-[var(--bg-paper)]">{title}</h4>
        <p className="text-sm text-[rgba(245,237,224,0.6)]">{description}</p>
        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
