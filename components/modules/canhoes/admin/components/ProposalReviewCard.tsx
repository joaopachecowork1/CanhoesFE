import { Check, Paperclip, Plus, Trash2, X } from "lucide-react";

type ProposalStatus = "pending" | "approved" | "rejected" | "withdrawn";

type AttachmentData = {
  fileExtension?: string;
  fileName: string;
  id: string;
};

function formatDate(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("pt-PT");
}

/**
 * Review card component for displaying a proposal in review mode.
 * Matches the dark paper theme with moose-inspired border colors.
 * Shows proposal content with rich text formatting, attachments,
 * and action buttons for approval/rejection.
 *
 * @param id - Proposal ID
 * @param title - Main title/name of the proposal
 * @param status - Current status (pending, approved, rejected, withdrawn)
 * @param author - Author name (or display name)
 * @param date - Date string
 * @param icon - Optional icon for visual identification
 * @param description - Short description of the proposal
 * @param content - Rich text content of the proposal (HTML)
 * @param attachments - Array of attachment objects
 * @param onStatusChange - Callback when status is changed
 * @param onApprove - Callback when proposal is approved
 * @param onReject - Callback when proposal is rejected
 * @param onAttach - Callback when attachment is added
 * @param onDetach - Callback when attachment is removed
 * @example
 * ```tsx
 * <ProposalReviewCard
 *   id="123"
 *   title="Festa de Ano Novo"
 *   status="pending"
 *   author="João Silva"
 *   content="<p>Uma bela festa de fim de ano...</p>"
 *   onStatusChange={handleStatusChange}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 * />
 * ```
 */
export function ProposalReviewCard({
  attachments,
  author,
  content,
  date,
  id,
  icon,
  onApprove,
  onAttach,
  onAttachClose,
  onAttachClick,
  onDetach,
  onReject,
  onStatusChange,
  title,
}: Readonly<{
  attachments: AttachmentData[];
  author?: string | React.ReactNode;
  content: string;
  date?: string;
  icon?: React.ReactNode;
  id: string;
  onApprove?: (e: React.MouseEvent) => void;
  onAttach?: () => void;
  onAttachClose?: () => void;
  onAttachClick?: (attachment: AttachmentData) => void;
  onDetach?: (attachmentId: string) => void;
  onReject?: (e: React.MouseEvent) => void;
  onStatusChange?: (status: ProposalStatus) => void;
  title: string;
  status: ProposalStatus;
}>) {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = status === "pending";
  const isWithdrawn = status === "withdrawn";

  return (
    <div
      data-proposal-id={id}
      className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(16,20,11,0.5)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[rgba(212,184,150,0.1)] p-4">
        <div className="flex items-center gap-3">
          {icon && <div className="shrink-0">{icon}</div>}
          <div>
            <h3 className="text-lg font-semibold text-[var(--bg-paper)]">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-[rgba(245,237,224,0.6)]">
              {author && <span>por {author}</span>}
              {date && <span>• {formatDate(date)}</span>}
              {status && <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] uppercase ${
                isApproved ? "bg-[rgba(97,220,168,0.15)] text-[var(--color-success)]" :
                isRejected ? "bg-[rgba(224,90,58,0.15)] text-[var(--color-error)]" :
                isWithdrawn ? "bg-[rgba(140,140,140,0.15)] text-[rgba(140,140,140)]" :
                "bg-[rgba(253,224,71,0.15)] text-[var(--color-warning)]"
              }`}>{status}</span>}
            </div>
          </div>
        </div>
        {/* Status selector */}
        {isPending && onStatusChange && (
          <select
            className="text-xs rounded border border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.58)] px-2 py-1 text-[var(--bg-paper)] focus:border-[var(--color-moss)]"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ProposalStatus)}
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovar</option>
            <option value="rejected">Recusar</option>
            <option value="withdrawn">Retirar</option>
          </select>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium text-[var(--color-accent)]">Anexos</h4>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border border-[rgba(212,184,150,0.12)] bg-[rgba(14,18,9,0.6)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--color-moss)] hover:bg-[rgba(16,20,11,0.7)] ${
                    onDetach ? "group" : ""
                  }`}
                  onClick={() => onAttachClick && onAttachClick(attachment)}
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{attachment.fileName}</span>
                  {onDetach && (
                    <button
                      className="ml-auto text-[rgba(245,237,224,0.4)] hover:text-[var(--color-error)] hover:bg-[rgba(224,90,58,0.1)] rounded p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDetach(attachment.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rich content */}
        <div
          className="prose max-w-none text-sm text-[rgba(245,237,224,0.8)] prose-p:my-2 prose-code:bg-[rgba(177,140,255,0.15)] prose-code:text-[var(--color-accent)]"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap gap-2 border-t border-[rgba(212,184,150,0.1)] p-4">
        {/* Attach action */}
        {isPending && onAttach && (
          <button
            className="flex items-center gap-1.5 rounded border border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.58)] px-3 py-1.5 text-sm text-[var(--bg-paper)] transition-colors hover:bg-[rgba(18,23,12,0.65)]"
            onClick={onAttach}
          >
            <Plus className="h-4 w-4" />
            <span>Anexar</span>
          </button>
        )}

        {/* Close attachment modal */}
        {onAttachClose && (
          <button
            className="flex items-center gap-1.5 rounded border border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.58)] px-3 py-1.5 text-sm text-[var(--bg-paper)] transition-colors hover:bg-[rgba(18,23,12,0.65)]"
            onClick={onAttachClose}
          >
            Fechar
          </button>
        )}

        {/* Rejection button */}
        {isPending && onReject && (
          <button
            className="flex items-center gap-1.5 rounded border border-[rgba(224,90,58,0.2)] bg-[rgba(224,90,58,0.1)] px-3 py-1.5 text-sm text-[rgba(255,236,231,0.92)] transition-colors hover:bg-[rgba(224,90,58,0.15)]"
            onClick={onReject}
          >
            <X className="h-4 w-4" />
            <span>Recusar</span>
          </button>
        )}

        {/* Approval button */}
        {isPending && onApprove && (
          <button
            className="flex items-center gap-1.5 rounded border border-[rgba(97,220,168,0.2)] bg-[rgba(97,220,168,0.1)] px-3 py-1.5 text-sm text-[var(--color-success)] transition-colors hover:bg-[rgba(97,220,168,0.15)]"
            onClick={onApprove}
          >
            <Check className="h-4 w-4" />
            <span>Aprovar</span>
          </button>
        )}
      </div>
    </div>
  );
}
