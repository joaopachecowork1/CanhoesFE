"use client";

import type { ReactNode } from "react";
import { FilePenLine, Gavel, ScrollText, Trash2 } from "lucide-react";

import { AdminReviewCard } from "@/components/modules/canhoes/admin/components/AdminReviewCard";
import { AdminSectionSummary } from "@/components/modules/canhoes/admin/components/AdminSectionSummary";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { AdminStatusFilters } from "@/components/modules/canhoes/admin/components/AdminStatusFilters";
import { ProposalShell } from "@/components/modules/canhoes/admin/components/ProposalShell";
import { statusBadgeVariant } from "@/components/modules/canhoes/admin/moderationUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";

import {
  usePendingProposalModeration,
  type PendingProposalCard,
  type PendingProposalField,
} from "./usePendingProposalModeration";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_OPTIONS } from "./proposalConstants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PendingProposalsProps = {
  eventId: string | null;
  categoryProposals: CategoryProposalDto[];
  measureProposalsAll: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

function renderProposalPanelState(
  loading: boolean,
  controlsDisabled: boolean,
  hasItems: boolean,
  emptyMessage: string
) {
  if (loading) return <AdminStateMessage>A carregar propostas...</AdminStateMessage>;
  if (controlsDisabled) {
    return (
      <AdminStateMessage>
        Falta uma edicao ativa para abrir a moderacao.
      </AdminStateMessage>
    );
  }
  return hasItems ? null : <AdminStateMessage variant="panel">{emptyMessage}</AdminStateMessage>;
}

function ProposalFieldInput({ field }: Readonly<{ field: PendingProposalField }>) {
  const icon = field.icon === "name" ? (
    <FilePenLine className="h-3.5 w-3.5" />
  ) : (
    <ScrollText className="h-3.5 w-3.5" />
  );

  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className="editorial-kicker flex items-center gap-2">
        {icon}
        {field.label}
      </label>
      {field.multiline ? (
        <Textarea
          id={field.id}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          disabled={field.disabled}
          placeholder={field.placeholder}
          rows={3}
        />
      ) : (
        <Input
          id={field.id}
          value={field.value}
          onChange={(event) => field.onChange(event.target.value)}
          disabled={field.disabled}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}

type ProposalCardActionsProps = {
  deleteIcon?: ReactNode;
  deleteLabel?: string;
  isBusy: boolean;
  onApprove?: () => void;
  onDelete: () => void;
  onReject?: () => void;
  onReopen?: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel: string;
};

function ProposalCardActions({
  deleteIcon,
  deleteLabel = "Apagar",
  isBusy,
  onApprove,
  onDelete,
  onReject,
  onReopen,
  onSave,
  saveDisabled = false,
  saveLabel,
}: Readonly<ProposalCardActionsProps>) {
  const actions: Array<{
    key: string;
    label: string;
    onClick: () => void;
    variant?: "destructive" | "outline";
  }> = [];

  if (onApprove) actions.push({ key: "approve", label: "Aprovar", onClick: onApprove });
  if (onReject) {
    actions.push({
      key: "reject",
      label: "Rejeitar",
      onClick: onReject,
      variant: "destructive",
    });
  }
  if (onReopen) {
    actions.push({
      key: "reopen",
      label: "Reabrir",
      onClick: onReopen,
      variant: "outline",
    });
  }

  return (
    <>
      <Button variant="outline" disabled={isBusy || saveDisabled} onClick={onSave}>
        {saveLabel}
      </Button>
      {actions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant}
          disabled={isBusy}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
      <Button
        variant="outline"
        disabled={isBusy}
        className={deleteIcon ? "gap-2" : undefined}
        onClick={onDelete}
      >
        {deleteIcon}
        {deleteLabel}
      </Button>
    </>
  );
}

function ProposalReviewCard({ proposal }: Readonly<{ proposal: PendingProposalCard }>) {
  return (
    <AdminReviewCard
      title={proposal.title}
      meta={proposal.meta}
      status={
        <Badge variant={statusBadgeVariant(proposal.status)}>{proposal.status}</Badge>
      }
      actions={
        <ProposalCardActions
          isBusy={proposal.isBusy}
          onSave={proposal.onSave}
          saveLabel={proposal.saveLabel}
          saveDisabled={proposal.saveDisabled}
          onApprove={proposal.onApprove}
          onReject={proposal.onReject}
          onReopen={proposal.onReopen}
          onDelete={proposal.onDelete}
          deleteLabel={proposal.deleteLabel}
          deleteIcon={
            proposal.deleteIcon === "trash" ? <Trash2 className="h-4 w-4" /> : undefined
          }
        />
      }
    >
      {proposal.note ? (
        <div className="flex items-center gap-2 text-[var(--color-title)]">
          <Gavel className="h-4 w-4" />
          <span className="editorial-kicker">
            {PROPOSAL_STATUS_LABELS[proposal.note as keyof typeof PROPOSAL_STATUS_LABELS] ?? proposal.note}
          </span>
        </div>
      ) : null}

      {proposal.fields.map((field) => (
        <ProposalFieldInput key={field.id} field={field} />
      ))}
    </AdminReviewCard>
  );
}

export function PendingProposals({
  eventId,
  categoryProposals,
  measureProposalsAll,
  loading,
  onUpdate,
}: Readonly<PendingProposalsProps>) {
  const moderation = usePendingProposalModeration({
    categoryProposals,
    eventId,
    measureProposalsAll,
    onUpdate,
  });

  return (
    <div className="space-y-4">
      <AdminSectionSummary
        kicker="Fila de moderacao"
        title="Propostas por fechar"
        description="Fecha categorias e medidas com filtros claros, contexto legivel e acoes rapidas em mobile."
        items={[
          {
            label: "Categorias pendentes",
            value: moderation.categoryCounts.pending,
            tone: moderation.categoryCounts.pending > 0 ? "highlight" : "default",
          },
          {
            label: "Medidas pendentes",
            value: moderation.measureCounts.pending,
            tone: moderation.measureCounts.pending > 0 ? "highlight" : "default",
          },
          {
            label: "Categorias tratadas",
            value:
              moderation.categoryCounts.approved + moderation.categoryCounts.rejected,
            tone: "muted",
          },
          {
            label: "Medidas tratadas",
            value: moderation.measureCounts.approved + moderation.measureCounts.rejected,
            tone: "muted",
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {moderation.panels.map((panel) => (
          <ProposalShell
            key={panel.type}
            title={`${panel.title} (${panel.totalCount})`}
            subtitle={panel.subtitle}
            description={panel.description}
          >
            <AdminStatusFilters
              active={panel.filter}
              counts={panel.counts}
              labels={PROPOSAL_STATUS_LABELS}
              onChange={panel.setFilter}
              options={PROPOSAL_STATUS_OPTIONS}
            />

            {renderProposalPanelState(
              loading,
              moderation.controlsDisabled,
              panel.items.length > 0,
              panel.emptyMessage
            )}

            {!loading &&
              !moderation.controlsDisabled &&
              panel.items.map((proposal) => (
                <ProposalReviewCard key={proposal.id} proposal={proposal} />
              ))}
          </ProposalShell>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={moderation.deleteRequest !== null}
        onOpenChange={(open) => !open && moderation.clearDeleteRequest()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove a proposta &ldquo;
              {moderation.deleteRequest?.title ?? ""}
              &rdquo; permanentemente. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => moderation.clearDeleteRequest()}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => moderation.deleteRequest?.onConfirm()}
            >
              Apagar proposta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
