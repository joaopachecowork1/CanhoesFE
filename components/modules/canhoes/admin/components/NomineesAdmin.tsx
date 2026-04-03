"use client";

import { useMemo, useState } from "react";
import { Check, FolderTree, X } from "lucide-react";
import { toast } from "sonner";

import { AdminReviewCard } from "@/components/modules/canhoes/admin/components/AdminReviewCard";
import { AdminSectionSummary } from "@/components/modules/canhoes/admin/components/AdminSectionSummary";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { AdminStatusFilters } from "@/components/modules/canhoes/admin/components/AdminStatusFilters";
import { statusBadgeVariant } from "@/components/modules/canhoes/admin/moderationUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import type { AwardCategoryDto, NomineeDto } from "@/lib/api/types";

type StatusFilter = "all" | "pending" | "approved";

type NomineesAdminProps = {
  eventId: string | null;
  nominees: NomineeDto[];
  categories: AwardCategoryDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: "Todas",
  pending: "Pendentes",
  approved: "Aprovadas",
};

export function NomineesAdmin({
  eventId,
  nominees,
  categories,
  loading,
  onUpdate,
}: Readonly<NomineesAdminProps>) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const controlsDisabled = !eventId;

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const filteredNominees = useMemo(() => {
    if (statusFilter === "all") return nominees;
    return nominees.filter((nominee) => nominee.status === statusFilter);
  }, [nominees, statusFilter]);

  const counts = useMemo(
    () => ({
      all: nominees.length,
      approved: nominees.filter((nominee) => nominee.status === "approved").length,
      pending: nominees.filter((nominee) => nominee.status === "pending").length,
    }),
    [nominees]
  );

  const withProcessing = async (
    nomineeId: string,
    action: () => Promise<unknown>,
    errorFallback = "Nao foi possivel processar a nomeacao."
  ) => {
    setProcessingIds((previousIds) => new Set(previousIds).add(nomineeId));

    try {
      await action();
      await onUpdate();
      toast.success("Acao concluida");
    } catch (error) {
      logFrontendError("Admin.Nominees.withProcessing", error, { nomineeId });
      toast.error(getErrorMessage(error, errorFallback));
    } finally {
      setProcessingIds((previousIds) => {
        const nextIds = new Set(previousIds);
        nextIds.delete(nomineeId);
        return nextIds;
      });
    }
  };

  const setNomineeCategory = (nomineeId: string, categoryId: string) =>
    withProcessing(nomineeId, () =>
      canhoesEventsRepo.adminSetNomineeCategory(eventId!, nomineeId, {
        categoryId: categoryId && categoryId !== "__none__" ? categoryId : null,
      }),
      "Nao foi possivel atualizar a categoria da nomeacao."
    );

  const approveNominee = (nomineeId: string) =>
    withProcessing(
      nomineeId,
      () => canhoesEventsRepo.adminApproveNominee(eventId!, nomineeId),
      "Nao foi possivel aprovar a nomeacao."
    );

  const rejectNominee = (nomineeId: string) =>
    withProcessing(
      nomineeId,
      () => canhoesEventsRepo.adminRejectNominee(eventId!, nomineeId),
      "Nao foi possivel rejeitar a nomeacao."
    );

  return (
    <div className="space-y-5">
      <AdminSectionSummary
        kicker="Moderacao"
        title="Nomeacoes em revisao"
        description="Atribui categoria, aprova ou rejeita cada nomeacao sem perder contexto no telemovel."
        items={[
          {
            label: "Pendentes",
            value: counts.pending,
            tone: counts.pending > 0 ? "highlight" : "default",
          },
          {
            label: "Aprovadas",
            value: counts.approved,
            tone: "default",
          },
          {
            label: "Total",
            value: counts.all,
            tone: "muted",
          },
          {
            label: "Categorias",
            value: categories.length,
            tone: "muted",
          },
        ]}
      />

      <Card className="border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(177,140,255,0.12),transparent_34%),linear-gradient(180deg,rgba(18,24,11,0.94),rgba(11,14,8,0.96))] text-[var(--bg-paper)] shadow-[var(--shadow-panel)]">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <p className="editorial-kicker text-[var(--neon-green)]">Fila ativa</p>
            <CardTitle className="text-[var(--bg-paper)]">Rever nomeacoes</CardTitle>
            <p className="body-small text-[rgba(245,237,224,0.76)]">
              Filtra o estado atual e fecha cada registo com categoria e decisao clara.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <AdminStatusFilters
              active={statusFilter}
              counts={counts}
              labels={FILTER_LABELS}
              onChange={setStatusFilter}
              options={["all", "pending", "approved"]}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? <AdminStateMessage>A carregar nomeacoes...</AdminStateMessage> : null}

          {!loading && controlsDisabled ? (
            <AdminStateMessage>
              Falta uma edicao ativa para abrir a moderacao.
            </AdminStateMessage>
          ) : null}

          {!loading && !controlsDisabled && filteredNominees.length === 0 ? (
            <AdminStateMessage variant="panel">
              Nao ha nomeacoes neste estado.
            </AdminStateMessage>
          ) : null}

          {!loading &&
            !controlsDisabled &&
            filteredNominees.map((nominee) => {
              const isBusy = processingIds.has(nominee.id);
              const categoryName = nominee.categoryId
                ? categoryNameById.get(nominee.categoryId)
                : null;

              return (
                <AdminReviewCard
                  key={nominee.id}
                  title={nominee.title}
                  meta={new Date(nominee.createdAtUtc).toLocaleString("pt-PT")}
                  status={<Badge variant={statusBadgeVariant(nominee.status)}>{nominee.status}</Badge>}
                  actions={
                    <>
                      {nominee.status === "pending" ? (
                        <Button
                          disabled={isBusy || controlsDisabled || !nominee.categoryId}
                          onClick={() => approveNominee(nominee.id)}
                          className="gap-2"
                          title={
                            nominee.categoryId
                              ? "Aprovar nomeacao"
                              : "Atribui uma categoria primeiro"
                          }
                        >
                          <Check className="h-4 w-4" />
                          Aprovar
                        </Button>
                      ) : null}

                      {(nominee.status === "pending" || nominee.status === "approved") && (
                        <Button
                          variant="destructive"
                          disabled={isBusy || controlsDisabled}
                          onClick={() => rejectNominee(nominee.id)}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      )}
                    </>
                  }
                >
                  <div className="flex flex-wrap gap-2 text-xs text-[rgba(245,237,224,0.72)]">
                    <span className="rounded-full border border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.86)] px-2.5 py-1 text-[var(--bg-paper)]">
                      {categoryName ?? "Sem categoria"}
                    </span>
                    <span className="rounded-full border border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.86)] px-2.5 py-1 text-[var(--bg-paper)]">
                      {nominee.status === "pending" ? "Em revisao" : "Ja tratado"}
                    </span>
                  </div>

                  {nominee.status === "pending" ? (
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                      <div className="space-y-2">
                        <label className="editorial-kicker flex items-center gap-2">
                          <FolderTree className="h-3.5 w-3.5" />
                          Categoria
                        </label>
                        <Select
                          value={nominee.categoryId ?? "__none__"}
                          onValueChange={(value) => setNomineeCategory(nominee.id, value)}
                          disabled={isBusy || controlsDisabled}
                        >
                          <SelectTrigger className="border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.92)] text-[var(--bg-paper)] data-[placeholder]:text-[rgba(245,237,224,0.56)] [&_svg:not([class*='text-'])]:text-[rgba(245,237,224,0.62)] focus-visible:bg-[rgba(18,23,12,0.92)]">
                            <SelectValue placeholder="Escolhe uma categoria" />
                          </SelectTrigger>
                          <SelectContent className="border-[rgba(212,184,150,0.16)] bg-[rgba(18,23,12,0.98)] text-[var(--bg-paper)]">
                            <SelectItem className="text-[var(--bg-paper)] focus:bg-[rgba(177,140,255,0.2)] focus:text-[var(--bg-paper)]" value="__none__">(sem categoria)</SelectItem>
                            {categories.map((category) => (
                              <SelectItem className="text-[var(--bg-paper)] focus:bg-[rgba(177,140,255,0.2)] focus:text-[var(--bg-paper)]" key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {nominee.categoryId ? null : (
                        <div className="rounded-[var(--radius-sm-token)] border border-[rgba(224,90,58,0.26)] bg-[rgba(101,30,26,0.3)] px-3 py-2 text-xs text-[rgba(255,225,220,0.95)] lg:self-end">
                          Categoria obrigatoria para aprovar.
                        </div>
                      )}
                    </div>
                  ) : null}
                </AdminReviewCard>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
