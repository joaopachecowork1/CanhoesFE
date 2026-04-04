import { Calendar, Trash2, User } from "lucide-react";

type ProposalStatus = "pending" | "approved" | "rejected" | "withdrawn";

const statusToToneMap: Record<ProposalStatus, string> = {
  approved: "",
  pending: "",
  rejected: "",
  withdrawn: "",
};

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
 * Card component for displaying a single proposal.
 * Matches the dark paper theme with moose-inspired border colors.
 * Shows full proposal details with status, author, date, and actions.
 *
 * @param id - Proposal ID
 * @param title - Main title/name of the proposal
 * @param status - Current status (pending, approved, rejected, withdrawn)
 * @param author - Author name (or display name)
 * @param date - Date string
 * @param icon - Optional icon for visual identification
 * @param description - Short description of the proposal
 * @param onClick - Callback when card is clicked
 * @param onStatusChange - Callback when status is changed
 * @param onDelete - Callback when proposal is deleted
 * @param isEditing - Whether the card is in edit mode
 * @example
 * ```tsx
 * <ProposalCard
 *   id="123"
 *   title="Festa de Ano Novo"
 *   status="pending"
 *   author="João Silva"
 *   date="2024-01-15"
 *   onClick={handleProposalClick}
 * />
 * ```
 */
export function ProposalCard({
  author,
  date,
  description,
  id,
  icon,
  onClick,
  onDelete,
  onStatusChange,
  status,
  title,
}: Readonly<{
  author?: string | React.ReactNode;
  date?: string;
  description?: string;
  id: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: ProposalStatus) => void;
  status: ProposalStatus;
  title?: React.ReactNode;
}>) {
  const statusTone = statusToToneMap[status];
  const statusLabel = statusToLabelMap[status];
  const statusIcon = statusToIconMap[status];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(16,20,11,0.5)] transition-all hover:border-[var(--color-moss)] hover:shadow-[var(--shadow-card-hover)] ${
        statusTone
      }`}
    >
      <div
        className={`absolute top-0 right-0 m-2 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
          status === "approved"
            ? "bg-[rgba(97,220,168,0.15)] border-[rgba(97,220,168,0.2)] text-[var(--color-success)]"
            : status === "pending"
            ? "bg-[rgba(253,224,71,0.15)] border-[rgba(253,224,71,0.2)] text-[var(--color-warning)]"
            : status === "rejected"
            ? "bg-[rgba(224,90,58,0.15)] border-[rgba(224,90,58,0.2)] text-[var(--color-error)]"
            : "bg-[rgba(102,126,255,0.15)] border-[rgba(102,126,255,0.2)] text-[var(--color-accent)]"
        }`}
      >
        {statusLabel}
      </div>
      <div
        className={`relative flex flex-col p-5 ${
          icon ? "items-center text-center" : "items-start text-left"
        }`}
      >
        {icon && <div className="mb-4 text-[var(--color-accent)]">{icon}</div>}
        <h3 className="mb-2 text-lg font-semibold text-[var(--bg-paper)]">{title}</h3>
        {description && <p className="mb-4 text-sm text-[rgba(245,237,224,0.7)]">{description}</p>}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[rgba(245,237,224,0.6)]">
          {author && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3 shrink-0" />
              <span>{author}</span>
            </div>
          )}
          {date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{formatDate(date)}</span>
            </div>
          )}
        </div>
        {statusIcon && (
          <div className="mt-4 flex justify-center">
            {statusIcon}
          </div>
        )}
      </div>
      {(onClick || onStatusChange || onDelete) && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={onClick}
          role="button"
          tabIndex={-1}
        />
      )}
      {onDelete && (
        <button
          className="absolute right-2 top-2 rounded p-1.5 text-[rgba(245,237,224,0.3)] transition-colors hover:text-[var(--color-error)] hover:bg-[rgba(224,90,58,0.1)] focus:outline-none focus:ring-2 focus:ring-[rgba(224,90,58,0.4)]"
          onClick={handleDelete}
          type="button"
        >
            <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
