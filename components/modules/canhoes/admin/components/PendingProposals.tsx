"use client";

import { useMemo, useState } from "react";
import { FilePenLine, Gavel, ScrollText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminReviewCard } from "@/components/modules/canhoes/admin/components/AdminReviewCard";
import { AdminSectionSummary } from "@/components/modules/canhoes/admin/components/AdminSectionSummary";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { AdminStatusFilters } from "@/components/modules/canhoes/admin/components/AdminStatusFilters";
import {
  statusBadgeVariant,
  summarizeModerationStatuses,
} from "@/components/modules/canhoes/admin/moderationUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type {
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";

type PendingProposalsProps = {
  eventId: string | null;
  categoryProposals: CategoryProposalDto[];
  measureProposalsAll: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type ProposalStatus = "pending" | "approved" | "rejected";
type ProposalFilter = "all" | ProposalStatus;

type CategoryDraft = {
  description: string;
  name: string;
};

const FILTER_LABELS: Record<ProposalFilter, string> = {
  all: "Todas",
  approved: "Aprovadas",
  pending: "Pendentes",
  rejected: "Rejeitadas",
};

function ProposalShell({
  children,
  description,
  subtitle,
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  subtitle: string;
  title: string;
}>) {
  return (
    <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
      <CardHeader className="space-y-2">
        <p className="editorial-kicker">{subtitle}</p>
        <CardTitle>{title}</CardTitle>
        <p className="body-small text-[var(--color-text-muted)]">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
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

  const controlsDisabled = !eventId;

  const categoryCounts = useMemo(
    () => ({
      all: categoryProposals.length,
      ...summarizeModerationStatuses(categoryProposals),
    }),
    [categoryProposals]
  );

  const measureCounts = useMemo(
    () => ({
      all: measureProposalsAll.length,
      ...summarizeModerationStatuses(measureProposalsAll),
    }),
    [measureProposalsAll]
  );

  const filteredCategoryProposals = useMemo(
    () =>
      categoryFilter === "all"
        ? categoryProposals
        : categoryProposals.filter((proposal) => proposal.status === categoryFilter),
    [categoryFilter, categoryProposals]
  );

  const filteredMeasureProposals = useMemo(
    () =>
      measureFilter === "all"
        ? measureProposalsAll
        : measureProposalsAll.filter((proposal) => proposal.status === measureFilter),
    [measureFilter, measureProposalsAll]
  );

  const withProcessing = async (
    proposalId: string,
    action: () => Promise<unknown>,
    successMessage = "Acao concluida"
  ) => {
    setProcessingIds((previousIds) => new Set(previousIds).add(proposalId));

    try {
      await action();
      await onUpdate();
      toast.success(successMessage);
    } catch (error) {
      console.error("Proposal action error:", error);
      toast.error("Erro ao processar proposta");
    } finally {
      setProcessingIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.delete(proposalId);
        return nextIds;
      });
    }
  };

  const setCategoryDraft = (
    proposal: CategoryProposalDto,
    patch: Partial<CategoryDraft>
  ) => {
    setCategoryDrafts((previousDrafts) => ({
      ...previousDrafts,
      [proposal.id]: {
        description: previousDrafts[proposal.id]?.description ?? proposal.description ?? "",
        name: previousDrafts[proposal.id]?.name ?? proposal.name,
        ...patch,
      },
    }));
  };

  const getCategoryDraft = (proposal: CategoryProposalDto): CategoryDraft => ({
    description: categoryDrafts[proposal.id]?.description ?? proposal.description ?? "",
    name: categoryDrafts[proposal.id]?.name ?? proposal.name,
  });

  const buildCategoryProposalPatch = (proposal: CategoryProposalDto) => {
    const draft = getCategoryDraft(proposal);
    const normalizedName = draft.name.trim();

    if (!normalizedName) {
      toast.error("O nome da proposta e obrigatorio");
      return null;
    }

    return {
      description: draft.description.trim() || null,
      name: normalizedName,
    };
  };

  const saveCategoryProposal = async (proposal: CategoryProposalDto) => {
    const patch = buildCategoryProposalPatch(proposal);
    if (!eventId || !patch) return;

    await withProcessing(
      proposal.id,
      () => canhoesEventsRepo.adminUpdateCategoryProposal(eventId, proposal.id, patch),
      "Proposta de categoria atualizada"
    );
  };

  const setCategoryProposalStatus = async (
    proposal: CategoryProposalDto,
    status: ProposalStatus
  ) => {
    const patch = buildCategoryProposalPatch(proposal);
    if (!eventId || !patch) return;

    await withProcessing(
      proposal.id,
      () =>
        canhoesEventsRepo.adminUpdateCategoryProposal(eventId, proposal.id, {
          ...patch,
          status,
        }),
      status === "approved"
        ? "Proposta aprovada"
        : status === "rejected"
          ? "Proposta rejeitada"
          : "Proposta reaberta"
    );
  };

  const deleteCategoryProposal = async (proposal: CategoryProposalDto) => {
    if (!eventId) return;
    if (!window.confirm(`Apagar a proposta "${proposal.name}"?`)) return;

    await withProcessing(
      proposal.id,
      () => canhoesEventsRepo.adminDeleteCategoryProposal(eventId, proposal.id),
      "Proposta removida"
    );
  };

  const setMeasureDraft = (proposalId: string, text: string) => {
    setMeasureDrafts((previousDrafts) => ({
      ...previousDrafts,
      [proposalId]: text,
    }));
  };

  const getMeasureDraft = (proposal: MeasureProposalDto) =>
    measureDrafts[proposal.id] ?? proposal.text;

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
            value: categoryCounts.approved + categoryCounts.rejected,
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
        <ProposalShell
          title={`Categorias em revisao (${categoryProposals.length})`}
          subtitle="Moderacao"
          description="Reve, corrige e fecha propostas de categoria sem sair da fila de revisao."
        >
          <AdminStatusFilters
            active={categoryFilter}
            counts={categoryCounts}
            labels={FILTER_LABELS}
            onChange={setCategoryFilter}
            options={["all", "pending", "approved", "rejected"]}
          />

          {loading ? <AdminStateMessage>A carregar propostas...</AdminStateMessage> : null}

          {!loading && controlsDisabled ? (
            <AdminStateMessage>
              Falta uma edicao ativa para abrir a moderacao.
            </AdminStateMessage>
          ) : null}

          {!loading && !controlsDisabled && filteredCategoryProposals.length === 0 ? (
            <AdminStateMessage variant="panel">
              Sem propostas de categoria neste estado.
            </AdminStateMessage>
          ) : null}

          {!loading &&
            !controlsDisabled &&
            filteredCategoryProposals.map((proposal) => {
              const isBusy = processingIds.has(proposal.id);
              const draft = getCategoryDraft(proposal);

              return (
                <AdminReviewCard
                  key={proposal.id}
                  title={draft.name || proposal.name}
                  meta={new Date(proposal.createdAtUtc).toLocaleString("pt-PT")}
                  status={
                    <Badge variant={statusBadgeVariant(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  }
                  actions={
                    <>
                      <Button
                        variant="outline"
                        disabled={isBusy || controlsDisabled}
                        onClick={() => void saveCategoryProposal(proposal)}
                      >
                        Guardar
                      </Button>

                      {proposal.status !== "approved" ? (
                        <Button
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            void setCategoryProposalStatus(proposal, "approved")
                          }
                        >
                          Aprovar
                        </Button>
                      ) : null}

                      {proposal.status !== "rejected" ? (
                        <Button
                          variant="destructive"
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            void setCategoryProposalStatus(proposal, "rejected")
                          }
                        >
                          Rejeitar
                        </Button>
                      ) : null}

                      {proposal.status !== "pending" ? (
                        <Button
                          variant="outline"
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            void setCategoryProposalStatus(proposal, "pending")
                          }
                        >
                          Reabrir
                        </Button>
                      ) : null}

                      <Button
                        variant="outline"
                        disabled={isBusy || controlsDisabled}
                        onClick={() => void deleteCategoryProposal(proposal)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Apagar
                      </Button>
                    </>
                  }
                >
                  <div className="space-y-2">
                    <label className="editorial-kicker flex items-center gap-2">
                      <FilePenLine className="h-3.5 w-3.5" />
                      Nome da categoria
                    </label>
                    <Input
                      value={draft.name}
                      onChange={(event) =>
                        setCategoryDraft(proposal, { name: event.target.value })
                      }
                      disabled={isBusy}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="editorial-kicker flex items-center gap-2">
                      <ScrollText className="h-3.5 w-3.5" />
                      Descricao
                    </label>
                    <Textarea
                      value={draft.description}
                      onChange={(event) =>
                        setCategoryDraft(proposal, {
                          description: event.target.value,
                        })
                      }
                      disabled={isBusy}
                      placeholder="Contexto da proposta"
                      rows={3}
                    />
                  </div>
                </AdminReviewCard>
              );
            })}
        </ProposalShell>

        <ProposalShell
          title={`Medidas em revisao (${measureProposalsAll.length})`}
          subtitle="Moderacao"
          description="Fecha medidas propostas com o mesmo fluxo de aprovacao, rejeicao e reabertura."
        >
          <AdminStatusFilters
            active={measureFilter}
            counts={measureCounts}
            labels={FILTER_LABELS}
            onChange={setMeasureFilter}
            options={["all", "pending", "approved", "rejected"]}
          />

          {loading ? <AdminStateMessage>A carregar propostas...</AdminStateMessage> : null}

          {!loading && controlsDisabled ? (
            <AdminStateMessage>
              Falta uma edicao ativa para abrir a moderacao.
            </AdminStateMessage>
          ) : null}

          {!loading && !controlsDisabled && filteredMeasureProposals.length === 0 ? (
            <AdminStateMessage variant="panel">
              Sem medidas neste estado.
            </AdminStateMessage>
          ) : null}

          {!loading &&
            !controlsDisabled &&
            filteredMeasureProposals.map((proposal) => {
              const isBusy = processingIds.has(proposal.id);
              const draftText = getMeasureDraft(proposal);

              return (
                <AdminReviewCard
                  key={proposal.id}
                  title="Medida proposta"
                  meta={new Date(proposal.createdAtUtc).toLocaleString("pt-PT")}
                  status={
                    <Badge variant={statusBadgeVariant(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  }
                  actions={
                    <>
                      <Button
                        variant="outline"
                        disabled={isBusy || controlsDisabled || !draftText.trim()}
                        onClick={() =>
                          withProcessing(
                            proposal.id,
                            async () => {
                              await canhoesEventsRepo.adminUpdateMeasureProposal(
                                eventId!,
                                proposal.id,
                                { text: draftText.trim() }
                              );
                            },
                            "Proposta atualizada"
                          )
                        }
                      >
                        Guardar texto
                      </Button>

                      {proposal.status !== "approved" ? (
                        <Button
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            withProcessing(
                              proposal.id,
                              async () => {
                                const normalizedText = draftText.trim();

                                if (normalizedText && normalizedText !== proposal.text) {
                                  await canhoesEventsRepo.adminUpdateMeasureProposal(
                                    eventId!,
                                    proposal.id,
                                    { text: normalizedText }
                                  );
                                }

                                await canhoesEventsRepo.adminApproveMeasureProposal(
                                  eventId!,
                                  proposal.id
                                );
                              },
                              "Proposta aprovada"
                            )
                          }
                        >
                          Aprovar
                        </Button>
                      ) : null}

                      {proposal.status !== "rejected" ? (
                        <Button
                          variant="destructive"
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            withProcessing(
                              proposal.id,
                              async () => {
                                await canhoesEventsRepo.adminRejectMeasureProposal(
                                  eventId!,
                                  proposal.id
                                );
                              },
                              "Proposta rejeitada"
                            )
                          }
                        >
                          Rejeitar
                        </Button>
                      ) : null}

                      {proposal.status !== "pending" ? (
                        <Button
                          variant="outline"
                          disabled={isBusy || controlsDisabled}
                          onClick={() =>
                            withProcessing(
                              proposal.id,
                              async () => {
                                await canhoesEventsRepo.adminUpdateMeasureProposal(
                                  eventId!,
                                  proposal.id,
                                  { status: "pending" }
                                );
                              },
                              "Proposta reaberta"
                            )
                          }
                        >
                          Reabrir
                        </Button>
                      ) : null}

                      <Button
                        variant="outline"
                        disabled={isBusy || controlsDisabled}
                        onClick={() =>
                          withProcessing(
                            proposal.id,
                            async () => {
                              await canhoesEventsRepo.adminDeleteMeasureProposal(
                                eventId!,
                                proposal.id
                              );
                            },
                            "Proposta removida"
                          )
                        }
                      >
                        Apagar
                      </Button>
                    </>
                  }
                >
                  <div className="flex items-center gap-2 text-[var(--color-title)]">
                    <Gavel className="h-4 w-4" />
                    <span className="editorial-kicker">
                      {FILTER_LABELS[proposal.status] ?? proposal.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="editorial-kicker flex items-center gap-2">
                      <ScrollText className="h-3.5 w-3.5" />
                      Texto da medida
                    </label>
                    <Input
                      value={draftText}
                      onChange={(event) =>
                        setMeasureDraft(proposal.id, event.target.value)
                      }
                      disabled={isBusy}
                      placeholder="Texto da proposta"
                    />
                  </div>
                </AdminReviewCard>
              );
            })}
        </ProposalShell>
      </div>
    </div>
  );
}
