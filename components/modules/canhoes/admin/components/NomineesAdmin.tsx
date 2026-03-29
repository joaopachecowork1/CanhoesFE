"use client";

import { useMemo, useState } from "react";
import { Check, FolderTree, X } from "lucide-react";
import { toast } from "sonner";

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
    action: () => Promise<unknown>
  ) => {
    setProcessingIds((previousIds) => new Set(previousIds).add(nomineeId));

    try {
      await action();
      await onUpdate();
      toast.success("Acao concluida");
    } catch (error) {
      console.error("Nominee action error:", error);
      toast.error("Erro ao processar a nomeacao");
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
        categoryId:
          categoryId && categoryId !== "__none__" ? categoryId : null,
      })
    );

  const approveNominee = (nomineeId: string) =>
    withProcessing(nomineeId, () =>
      canhoesEventsRepo.adminApproveNominee(eventId!, nomineeId)
    );

  const rejectNominee = (nomineeId: string) =>
    withProcessing(nomineeId, () =>
      canhoesEventsRepo.adminRejectNominee(eventId!, nomineeId)
    );

  return (
    <Card className="border-[var(--color-moss)]/20">
      <CardHeader className="space-y-3">
        <div className="space-y-1">
          <p className="editorial-kicker">Moderacao</p>
          <CardTitle>Nomeacoes</CardTitle>
          <p className="body-small text-[var(--color-text-muted)]">
            A lista deixa de parecer tabela apertada e passa a mostrar cada
            registo com contexto, categoria e accoes claras.
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
        {loading ? (
          <AdminStateMessage>A carregar nomeacoes...</AdminStateMessage>
        ) : null}

        {!loading && controlsDisabled ? (
          <AdminStateMessage>
            O evento ativo ainda nao ficou disponivel para moderacao.
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
              <article
                key={nominee.id}
                className="editorial-shell rounded-[var(--radius-md-token)] px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="heading-3 text-[var(--color-text-primary)]">
                        {nominee.title}
                      </h3>
                      <Badge variant={statusBadgeVariant(nominee.status)}>
                        {nominee.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                      <span className="rounded-full bg-[var(--color-bg-surface)] px-2.5 py-1">
                        {categoryName ?? "Sem categoria"}
                      </span>
                      <span className="rounded-full bg-[var(--color-bg-surface)] px-2.5 py-1">
                        {new Date(nominee.createdAtUtc).toLocaleString("pt-PT")}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
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

                    {(nominee.status === "pending" ||
                      nominee.status === "approved") && (
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
                  </div>
                </div>

                {nominee.status === "pending" ? (
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="space-y-2">
                      <label className="editorial-kicker flex items-center gap-2">
                        <FolderTree className="h-3.5 w-3.5" />
                        Categoria
                      </label>
                      <Select
                        value={nominee.categoryId ?? "__none__"}
                        onValueChange={(value) =>
                          setNomineeCategory(nominee.id, value)
                        }
                        disabled={isBusy || controlsDisabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolhe uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">(sem categoria)</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!nominee.categoryId ? (
                      <div className="rounded-[var(--radius-sm-token)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs text-[var(--color-text-muted)] lg:self-end">
                        Categoria obrigatoria para aprovar.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
      </CardContent>
    </Card>
  );
}
