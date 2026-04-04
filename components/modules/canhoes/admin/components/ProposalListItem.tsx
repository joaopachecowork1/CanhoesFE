type ProposalStatus = "pending" | "approved" | "rejected" | "withdrawn";

const statusToLabelMap: Record<ProposalStatus, string> = {
  approved: "Aprovada",
  pending: "Pendente",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
};

const statusToIconMap: Record<ProposalStatus, React.ReactNode> = {
  approved: null,
  pending: null,
  rejected: null,
  withdrawn: null,
};

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-PT");
}

/**
 * Compact list item for displaying a single proposal.
 * Matches the dark paper theme with moose-inspired border colors.
 * Used in proposal lists and proposal cards.
 *
 * @param id - Proposal ID
 * @param title - Main title/name of the proposal
 * @param status - Current status (pending, approved, rejected, withdrawn)
 * @param author - Author name (or display name)
 * @param date - Date string
 * @param icon - Optional icon for visual identification
 * @param onClick - Callback when item is clicked
 * @param isEditing - Whether the item is in edit mode
 * @example
 * ```tsx
 * <ProposalListItem
 *   id="123"
 *   title="Festa de Ano Novo"
 *   status="pending"
 *   author="João Silva"
 *   date="2024-01-15"
 *   onClick={handleProposalClick}
 * />
 * ```
 */
export function ProposalListItem({
  author,
  date,
  id,
  icon,
  onClick,
  status,
  title,
}: Readonly<{
  author?: string | React.ReactNode;
  date?: string;
  id: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  status: ProposalStatus;
  title?: React.ReactNode;
}>) {
  const statusLabel = statusToLabelMap[status];
  const statusIcon = statusToIconMap[status];

  return (
    <div
      className={`group relative flex cursor-pointer items-start gap-3 rounded-lg border border-[rgba(212,184,150,0.12)] bg-[rgba(16,20,11,0.5)] p-3 transition-all hover:bg-[rgba(16,20,11,0.7)] ${
        onClick ? "hover:border-[var(--color-moss)]" : ""
      }`}
      onClick={onClick}
      role="button"
      tabIndex={-1}
      data-proposal-id={id}
      title={`Proposta: ${title}`}
    >
      {icon && <div className="shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-[var(--bg-paper)] font-medium leading-snug">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-[rgba(245,237,224,0.6)] mt-0.5">
          {author && (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-full bg-[rgba(14,18,9,0.6)] px-1.5 text-[10px]">
                por {author}
              </span>
            </div>
          )}
          {date && (
            <div className="inline-flex items-center rounded-full bg-[rgba(14,18,9,0.6)] px-1.5 text-[10px]">
              {formatDate(date)}
            </div>
          )}
        </div>
        {status && (
          <div
            className={`mt-1.5 inline-flex items-center rounded-full px-1.5 text-[10px] font-medium ${
              status === "approved"
                ? "bg-[rgba(97,220,168,0.15)] text-[var(--color-success)]"
                : status === "pending"
                ? "bg-[rgba(253,224,71,0.15)] text-[var(--color-warning)]"
                : status === "rejected"
                ? "bg-[rgba(224,90,58,0.15)] text-[var(--color-error)]"
                : "bg-[rgba(102,126,255,0.15)] text-[var(--color-accent)]"
            }`}
          >
            {statusLabel}
          </div>
        )}
      </div>
      {statusIcon && (
        <div className="shrink-0 ml-2 opacity-50 group-hover:opacity-100 transition-opacity">
          {statusIcon}
        </div>
      )}
    </div>
  );
}
