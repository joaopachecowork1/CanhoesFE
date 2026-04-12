"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { summarizeModerationStatuses } from "@/components/modules/canhoes/admin/moderationUtils";
import type {
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

type ProposalStatus = "pending" | "approved" | "rejected";
type ProposalFilter = "all" | ProposalStatus;
type CategoryDraft = { description: string; name: string };
type ProposalCounts = Record<ProposalStatus, number> & { all: number };
type ProposalType = "category" | "measure";

type UsePendingProposalModerationArgs = {
  categoryProposals: CategoryProposalDto[];
  eventId: string | null;
  measureProposalsAll: MeasureProposalDto[];
  onUpdate: () => Promise<void>;
};

export type PendingProposalField = {
  disabled?: boolean;
  icon: "description" | "measure" | "name";
  id: string;
  label: string;
  multiline?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export type PendingProposalCard = {
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
  fields: PendingProposalField[];
};

export type PendingProposalPanel = {
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

export type DeleteConfirmationRequest = {
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

export function usePendingProposalModeration({
  categoryProposals,
  eventId,
  measureProposalsAll,
  onUpdate,
}: UsePendingProposalModerationArgs) {
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

  const buildCategoryCard = (proposal: CategoryProposalDto): PendingProposalCard => {
    const draft = getCategoryDraft(proposal);
    const isBusy = processingIds.has(proposal.id);

    return {
      deleteIcon: "trash",
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

        setDeleteRequest({
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

        void withProcessing(
          proposal.id,
          () => canhoesEventsRepo.adminDeleteMeasureProposal(eventId, proposal.id),
          "Proposta removida"
        );
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

  return {
    categoryCounts,
    controlsDisabled,
    deleteRequest,
    measureCounts,
    panels,
    clearDeleteRequest: () => setDeleteRequest(null),
  };
}
