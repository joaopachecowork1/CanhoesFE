"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FilePenLine, Gavel, ScrollText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminReviewCard } from "@/components/modules/canhoes/admin/components/AdminReviewCard";
import { AdminSectionSummary } from "@/components/modules/canhoes/admin/components/AdminSectionSummary";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { AdminStatusFilters } from "@/components/modules/canhoes/admin/components/AdminStatusFilters";
import { ProposalShell } from "@/components/modules/canhoes/admin/components/ProposalShell";
import { summarizeModerationStatuses, statusBadgeVariant } from "@/components/modules/canhoes/admin/moderationUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

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
import { ADMIN_OUTLINE_BUTTON_CLASS } from "./adminContentUi";

type PendingProposalsProps = {
  eventId: string | null;
  categoryProposals: CategoryProposalDto[];
  measureProposalsAll: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type ProposalStatus = "pending" | "approved" | "rejected";
type ProposalFilter = "all" | ProposalStatus;
type CategoryDraft = { description: string; name: string };
type ProposalCounts = Record<ProposalStatus, number> & { all: number };
type ProposalType = "category" | "measure";

type PendingProposalCard = {
  deleteIcon?: "trash";
  deleteLabel?: string;
  id: string;
  isBusy: boolean;
  meta: string;
  note?: string;
  onApprove?: () => void;
  onDelete: () => void;
  onReject?: () => void;
  onReopen?: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel: string;
  status: ProposalStatus;
  title: string;
  fields: Array<{ disabled?: boolean; icon: "description" | "measure" | "name"; id: string; label: string; multiline?: boolean; onChange: (value: string) => void; placeholder?: string; value: string }>;
};

type PendingProposalPanel = {
  counts: ProposalCounts;
  description: string;
  emptyMessage: string;
  filter: ProposalFilter;
  items: PendingProposalCard[];
  setFilter: (filter: ProposalFilter) => void;
  subtitle: string;
  title: string;
  totalCount: number;
  type: ProposalType;
};

type DeleteConfirmationRequest = {
  id: string;
  title: string;
  type: ProposalType;
  onConfirm: () => void;
};

const PANEL_META: Record<
  ProposalType,
  { description: string; emptyMessage: string; title: string }
> = {
  category: {
    description:
      "Reve, corrige e fecha propostas de categoria sem sair da fila de revisao.",
    emptyMessage: "Sem propostas de categoria neste estado.",
    title: "Categorias em revisao",
  },
  measure: {
    description:
      "Fecha medidas propostas com o mesmo fluxo de aprovacao, rejeicao e reabertura.",
    emptyMessage: "Sem medidas neste estado.",
    title: "Medidas em revisao",
  },
};

const buildCounts = <T extends { status: string }>(items: T[]): ProposalCounts => ({
  all: items.length,
  ...summarizeModerationStatuses(items),
});

function getStatusMessages(status: ProposalStatus) {
  switch (status) {
    case "approved":
      return {
        error: "Nao foi possivel aprovar a proposta.",
        success: "Proposta aprovada",
      };
    case "rejected":
      return {
        error: "Nao foi possivel rejeitar a proposta.",
        success: "Proposta rejeitada",
      };
    default:
      return {
        error: "Nao foi possivel reabrir a proposta.",
        success: "Proposta reaberta",
      };
  }
}

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

function ProposalFieldInput({ field }: Readonly<{ field: { disabled?: boolean; icon: "description" | "measure" | "name"; id: string; label: string; multiline?: boolean; onChange: (value: string) => void; placeholder?: string; value: string } }>) {
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
      <Button
        variant="outline"
        disabled={isBusy || saveDisabled}
        onClick={onSave}
        className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full sm:w-auto`}
      >
        {saveLabel}
      </Button>
      {actions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant}
          disabled={isBusy}
          onClick={action.onClick}
          aria-label={`${action.label} proposta`}
          className={`${action.variant === "outline" ? ADMIN_OUTLINE_BUTTON_CLASS : ""} w-full sm:w-auto`}
        >
          {action.label}
        </Button>
      ))}
      <Button
        variant="outline"
        disabled={isBusy}
        className={`${ADMIN_OUTLINE_BUTTON_CLASS} ${deleteIcon ? "w-full gap-2 sm:w-auto" : "w-full sm:w-auto"}`}
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
        <div className="flex items-center gap-2 text-[var(--ink-primary)]">
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
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [categoryFilter, setCategoryFilter] = useState<ProposalFilter>("pending");
  const [measureFilter, setMeasureFilter] = useState<ProposalFilter>("pending");
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, CategoryDraft>>({});
  const [measureDrafts, setMeasureDrafts] = useState<Record<string, string>>({});
  const [deleteRequest, setDeleteRequest] = useState<DeleteConfirmationRequest | null>(null);

  const controlsDisabled = !eventId;

  const withProcessing = async (
    proposalId: string,
    action: () => Promise<unknown>,
    successMessage = "Acao concluida",
    errorFallback = "Nao foi possivel processar a proposta."
  ) => {
    setProcessingIds((previous) => new Set(previous).add(proposalId));

    try {
      await action();
      await onUpdate();
      toast.success(successMessage);
    } catch (error) {
      logFrontendError("Admin.PendingProposals.withProcessing", error, { proposalId });
      toast.error(getErrorMessage(error, errorFallback));
    } finally {
      setProcessingIds((previous) => {
        const next = new Set(previous);
        next.delete(proposalId);
        return next;
      });
    }
  };

  const getCategoryDraft = (proposal: CategoryProposalDto): CategoryDraft => ({
    description: categoryDrafts[proposal.id]?.description ?? proposal.description ?? "",
    name: categoryDrafts[proposal.id]?.name ?? proposal.name,
  });

  const setCategoryDraft = (
    proposal: CategoryProposalDto,
    patch: Partial<CategoryDraft>
  ) => {
    setCategoryDrafts((previous) => ({
      ...previous,
      [proposal.id]: {
        description: previous[proposal.id]?.description ?? proposal.description ?? "",
        name: previous[proposal.id]?.name ?? proposal.name,
        ...patch,
      },
    }));
  };

  const buildCategoryPatch = (proposal: CategoryProposalDto) => {
    const draft = getCategoryDraft(proposal);
    const name = draft.name.trim();

    if (!name) {
      toast.error("O nome da proposta e obrigatorio");
      return null;
    }

    return {
      description: draft.description.trim() || null,
      name,
    };
  };

  const runCategoryMutation = async (
    proposal: CategoryProposalDto,
    action: (patch: { description: string | null; name: string }) => Promise<unknown>,
    successMessage: string,
    errorFallback: string
  ) => {
    const patch = buildCategoryPatch(proposal);
    if (!eventId || !patch) return;

    await withProcessing(proposal.id, () => action(patch), successMessage, errorFallback);
  };

  const getMeasureDraft = (proposal: MeasureProposalDto) =>
    measureDrafts[proposal.id] ?? proposal.text;

  const setMeasureDraft = (proposalId: string, text: string) => {
    setMeasureDrafts((previous) => ({ ...previous, [proposalId]: text }));
  };

  const getMeasureText = (proposal: MeasureProposalDto) => getMeasureDraft(proposal).trim();

  const categoryCounts = useMemo(() => buildCounts(categoryProposals), [categoryProposals]);
  const measureCounts = useMemo(() => buildCounts(measureProposalsAll), [measureProposalsAll]);

  const runCategoryStatusChange = (
    proposal: CategoryProposalDto,
    newStatus: ProposalStatus
  ) => {
    const { error, success } = getStatusMessages(newStatus);
    void runCategoryMutation(
      proposal,
      (patch) =>
        canhoesEventsRepo.adminUpdateCategoryProposal(eventId!, proposal.id, {
          ...patch,
          status: newStatus,
        }),
      success,
      error
    );
  };

  const requestDelete = ({
    id,
    title,
    type,
    onConfirm,
  }: DeleteConfirmationRequest) => {
    setDeleteRequest({ id, title, type, onConfirm });
  };

  const buildCategoryCard = (proposal: CategoryProposalDto): PendingProposalCard => {
    const draft = getCategoryDraft(proposal);
    const isBusy = processingIds.has(proposal.id);

    return {
      deleteIcon: "trash",
      deleteLabel: "Apagar proposta",
      fields: [
        {
          disabled: isBusy,
          icon: "name",
          id: `${proposal.id}-name`,
          label: "Nome da categoria",
          onChange: (value) => setCategoryDraft(proposal, { name: value }),
          value: draft.name,
        },
        {
          disabled: isBusy,
          icon: "description",
          id: `${proposal.id}-description`,
          label: "Descricao",
          multiline: true,
          onChange: (value) => setCategoryDraft(proposal, { description: value }),
          placeholder: "Contexto da proposta",
          value: draft.description,
        },
      ],
      id: proposal.id,
      isBusy,
      meta: new Date(proposal.createdAtUtc).toLocaleString("pt-PT"),
      onApprove:
        proposal.status !== "approved"
          ? () => runCategoryStatusChange(proposal, "approved")
          : undefined,
      onDelete: () => {
        if (!eventId) return;

        requestDelete({
          id: proposal.id,
          title: proposal.name,
          type: "category",
          onConfirm: () => {
            void withProcessing(
              proposal.id,
              () => canhoesEventsRepo.adminDeleteCategoryProposal(eventId, proposal.id),
              "Proposta removida",
              "Nao foi possivel apagar a proposta de categoria."
            );
          },
        });
      },
      onReject:
        proposal.status !== "rejected"
          ? () => runCategoryStatusChange(proposal, "rejected")
          : undefined,
      onReopen:
        proposal.status !== "pending"
          ? () => runCategoryStatusChange(proposal, "pending")
          : undefined,
      onSave: () => {
        void runCategoryMutation(
          proposal,
          (patch) =>
            canhoesEventsRepo.adminUpdateCategoryProposal(eventId!, proposal.id, patch),
          "Proposta de categoria atualizada",
          "Nao foi possivel atualizar a proposta de categoria."
        );
      },
      saveLabel: "Guardar",
      status: proposal.status,
      title: draft.name || proposal.name,
    };
  };

  const setMeasureStatus = (proposal: MeasureProposalDto, status: ProposalStatus) => {
    if (!eventId) return;
    const { success } = getStatusMessages(status);

    void withProcessing(
      proposal.id,
      async () => {
        const text = getMeasureText(proposal);
        if (text && text !== proposal.text) {
          await canhoesEventsRepo.adminUpdateMeasureProposal(eventId, proposal.id, { text });
        }

        if (status === "approved") {
          await canhoesEventsRepo.adminApproveMeasureProposal(eventId, proposal.id);
        } else if (status === "rejected") {
          await canhoesEventsRepo.adminRejectMeasureProposal(eventId, proposal.id);
        } else {
          await canhoesEventsRepo.adminUpdateMeasureProposal(eventId, proposal.id, {
            status: "pending",
          });
        }
      },
      success
    );
  };

  const buildMeasureCard = (proposal: MeasureProposalDto): PendingProposalCard => {
    const draftText = getMeasureDraft(proposal);
    const isBusy = processingIds.has(proposal.id);

    return {
      deleteIcon: "trash",
      deleteLabel: "Apagar proposta",
      fields: [
        {
          disabled: isBusy,
          icon: "measure",
          id: `${proposal.id}-text`,
          label: "Texto da medida",
          onChange: (value) => setMeasureDraft(proposal.id, value),
          placeholder: "Texto da proposta",
          value: draftText,
        },
      ],
      id: proposal.id,
      isBusy,
      meta: new Date(proposal.createdAtUtc).toLocaleString("pt-PT"),
      note: proposal.status,
      onApprove:
        proposal.status !== "approved" ? () => setMeasureStatus(proposal, "approved") : undefined,
      onDelete: () => {
        if (!eventId) return;

        requestDelete({
          id: proposal.id,
          title: "Medida proposta",
          type: "measure",
          onConfirm: () => {
            void withProcessing(
              proposal.id,
              () => canhoesEventsRepo.adminDeleteMeasureProposal(eventId, proposal.id),
              "Proposta removida"
            );
          },
        });
      },
      onReject:
        proposal.status !== "rejected" ? () => setMeasureStatus(proposal, "rejected") : undefined,
      onReopen:
        proposal.status !== "pending" ? () => setMeasureStatus(proposal, "pending") : undefined,
      onSave: () => {
        const text = getMeasureText(proposal);
        if (!eventId || !text) return;

        void withProcessing(
          proposal.id,
          () => canhoesEventsRepo.adminUpdateMeasureProposal(eventId, proposal.id, { text }),
          "Proposta atualizada"
        );
      },
      saveDisabled: !draftText.trim(),
      saveLabel: "Guardar texto",
      status: proposal.status,
      title: "Medida proposta",
    };
  };

  const buildPanel = <T extends { id: string; status: ProposalStatus }>(
    type: ProposalType,
    items: T[],
    filter: ProposalFilter,
    setFilter: (filter: ProposalFilter) => void,
    counts: ProposalCounts,
    buildCard: (item: T) => PendingProposalCard
  ): PendingProposalPanel => ({
    counts,
    description: PANEL_META[type].description,
    emptyMessage: PANEL_META[type].emptyMessage,
    filter,
    items: (filter === "all" ? items : items.filter((item) => item.status === filter)).map(
      buildCard
    ),
    setFilter,
    subtitle: "Moderacao",
    title: PANEL_META[type].title,
    totalCount: items.length,
    type,
  });

  const panels = [
    buildPanel(
      "category",
      categoryProposals,
      categoryFilter,
      setCategoryFilter,
      categoryCounts,
      buildCategoryCard
    ),
    buildPanel(
      "measure",
      measureProposalsAll,
      measureFilter,
      setMeasureFilter,
      measureCounts,
      buildMeasureCard
    ),
  ];

  const clearDeleteRequest = () => setDeleteRequest(null);

  return (
    <div className="space-y-4">
      <AdminSectionSummary
        kicker="Fila de moderacao"
        title="Propostas por fechar"
        description="Fecha categorias e medidas com filtros claros, contexto legivel e acoes rapidas em mobile."
        items={[
          {
            label: "Categorias pendentes",
            value: categoryCounts.pending,
            tone: categoryCounts.pending > 0 ? "highlight" : "default",
          },
          {
            label: "Medidas pendentes",
            value: measureCounts.pending,
            tone: measureCounts.pending > 0 ? "highlight" : "default",
          },
          {
            label: "Categorias tratadas",
            value:
              categoryCounts.approved + categoryCounts.rejected,
            tone: "muted",
          },
          {
            label: "Medidas tratadas",
            value: measureCounts.approved + measureCounts.rejected,
            tone: "muted",
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {panels.map((panel) => (
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
              controlsDisabled,
              panel.items.length > 0,
              panel.emptyMessage
            )}

            {!loading &&
              !controlsDisabled &&
              panel.items.map((proposal) => (
                <ProposalReviewCard key={proposal.id} proposal={proposal} />
              ))}
          </ProposalShell>
        ))}
      </div>

      <AlertDialog
        open={deleteRequest !== null}
        onOpenChange={(open) => !open && clearDeleteRequest()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove a proposta &ldquo;
              {deleteRequest?.title ?? ""}
              &rdquo; permanentemente. Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={clearDeleteRequest}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRequest?.onConfirm()}
            >
              Apagar proposta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
