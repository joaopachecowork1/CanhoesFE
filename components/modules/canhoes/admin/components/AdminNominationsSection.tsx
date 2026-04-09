"use client";

import { useMemo, useState } from "react";
import { Trophy, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AdminNomineeDto, AwardCategoryDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { formatDateTimeUtc } from "./dateUtils";
import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
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
import {
  ADMIN_CONTENT_CARD_CLASS,
  AdminDetailPanel,
  AdminDetailSheet,
  AdminListPanel,
  AdminSelectableButton,
} from "./adminContentUi";

type NominationStatus = "pending" | "approved" | "rejected";
type NominationListFilter = "all" | NominationStatus;

const NOMINATION_STATUS_LABELS: Record<NominationStatus, string> = {
  pending: "Pendentes",
  approved: "Aprovadas",
  rejected: "Rejeitadas",
};

const NOMINATION_EMPTY_STATE_LABELS: Record<NominationStatus, string> = {
  pending: "pendente",
  approved: "aprovada",
  rejected: "rejeitada",
};

const NOMINATION_BADGE_VARIANT_BY_STATUS: Record<
  AdminNomineeDto["status"],
  "default" | "destructive" | "secondary"
> = {
  approved: "default",
  pending: "secondary",
  rejected: "destructive",
};

function getCategoryName(categoryId: string | null | undefined, categories: AwardCategoryDto[]) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Sem categoria";
}

export function AdminNominationsSection({
  categories,
  eventId,
  initialRows,
}: Readonly<{
  categories: AwardCategoryDto[];
  eventId: string | null;
  initialRows?: AdminNomineeDto[];
}>) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<NominationListFilter>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rejectingNominationId, setRejectingNominationId] = useState<string | null>(null);
  const [selectedNominationId, setSelectedNominationId] = useState<string | null>(null);
  const queryEventId = eventId ?? "";

  const nominationsQuery = useQuery({
    queryKey: ["admin-nominations", queryEventId],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.adminGetNominationsWithAuthors(queryEventId),
    initialData: initialRows,
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-nominations", queryEventId] }),
      queryClient.invalidateQueries({ queryKey: ["official-voting", queryEventId] }),
      queryClient.invalidateQueries({ queryKey: ["canhoes", "admin-bootstrap", queryEventId] }),
    ]);
  };

  const approveNomination = useMutation({
    mutationFn: (nomineeId: string) =>
      canhoesEventsRepo.adminApproveNomination(queryEventId, nomineeId),
    onSuccess: async () => {
      toast.success("Nomeacao aprovada.");
      await invalidate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel aprovar a nomeacao."));
    },
  });

  const rejectNomination = useMutation({
    mutationFn: (nomineeId: string) =>
      canhoesEventsRepo.adminRejectNomination(queryEventId, nomineeId),
    onSuccess: async () => {
      setRejectingNominationId(null);
      toast.success("Nomeacao rejeitada.");
      await invalidate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel rejeitar a nomeacao."));
    },
  });

  const setCategory = useMutation({
    mutationFn: ({ nomineeId, categoryId }: { nomineeId: string; categoryId: string }) =>
      canhoesEventsRepo.adminSetNominationCategory(queryEventId, nomineeId, {
        categoryId: categoryId === "none" ? null : categoryId,
      }),
    onSuccess: async () => {
      toast.success("Categoria atualizada.");
      await invalidate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel mover a nomeacao."));
    },
  });

  const nominations = useMemo(() => nominationsQuery.data ?? [], [nominationsQuery.data]);

  const statusCounts = useMemo(
    () =>
      nominations.reduce(
        (accumulator, nomination) => {
          accumulator[nomination.status]++;
          return accumulator;
        },
        { pending: 0, approved: 0, rejected: 0 } as Record<NominationStatus, number>
      ),
    [nominations]
  );

  const filteredNominations = useMemo(() => {
    return nominations
      .filter((nomination) => {
        if (statusFilter === "all") return true;
        return nomination.status === statusFilter;
      })
      .filter((nomination) => {
        if (categoryFilter === "all") return true;
        return nomination.categoryId === categoryFilter;
      })
      .sort((left, right) => right.createdAtUtc.localeCompare(left.createdAtUtc));
  }, [categoryFilter, nominations, statusFilter]);

  const selectedNomination = useMemo(
    () => filteredNominations.find((nomination) => nomination.id === selectedNominationId) ?? null,
    [filteredNominations, selectedNominationId]
  );

  const anyMutationPending =
    approveNomination.isPending || rejectNomination.isPending || setCategory.isPending;

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para moderar nomeacoes.</AdminStateMessage>;
  }

  if (nominationsQuery.isLoading) {
    return <AdminStateMessage>A carregar nomeacoes...</AdminStateMessage>;
  }

  if (nominationsQuery.error) {
    logFrontendError("AdminNominationsSection.query", nominationsQuery.error, { eventId });
    return (
      <AdminStateMessage
        tone="error"
        action={<Button onClick={() => void nominationsQuery.refetch()}>Tentar novamente</Button>}
      >
        Nao foi possivel carregar as nomeacoes.
      </AdminStateMessage>
    );
  }

  return (
    <div className="space-y-4">
      <Card className={ADMIN_CONTENT_CARD_CLASS}>
        <CardHeader className="space-y-2">
          <p className="editorial-kicker">Moderacao</p>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Nomeacoes
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["pending", "approved", "rejected"] as const).map((status) => {
              const isActive = statusFilter === status;
              const label = NOMINATION_STATUS_LABELS[status];

              return (
                <Button
                  key={status}
                  size="sm"
                  variant={isActive ? "secondary" : "outline"}
                  className={cn(
                    isActive ? "border-[var(--border-neon)]" : "",
                    status === "pending" && statusCounts.pending > 0
                      ? "text-[var(--neon-amber)]"
                      : ""
                  )}
                  onClick={() => setStatusFilter(status)}
                >
                  {label}
                  <Badge
                    className={cn(
                      "ml-2",
                      status === "pending" && statusCounts.pending > 0
                        ? "animate-pulse bg-[rgba(255,184,0,0.12)] text-[var(--neon-amber)]"
                        : ""
                    )}
                  >
                    {statusCounts[status]}
                  </Badge>
                </Button>
              );
            })}

            <div className="ml-auto w-full sm:w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredNominations.length === 0 ? (
            <AdminStateMessage variant="panel">
              Fila limpa - nenhuma nomeacao{" "}
              {statusFilter === "all" ? "pendente" : NOMINATION_EMPTY_STATE_LABELS[statusFilter]}.
            </AdminStateMessage>
          ) : (
            <AdminListPanel bodyClassName="max-h-[56svh]">
              {filteredNominations.map((nomination) => {
                const isSelected = nomination.id === selectedNominationId;
                const categoryName = getCategoryName(nomination.categoryId, categories);

                return (
                  <AdminSelectableButton
                    key={nomination.id}
                    type="button"
                    onClick={() => setSelectedNominationId(nomination.id)}
                    selected={isSelected}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                          {nomination.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[rgba(245,237,224,0.72)]">
                          {categoryName}
                        </p>
                      </div>
                      <Badge variant={NOMINATION_BADGE_VARIANT_BY_STATUS[nomination.status]}>
                        {nomination.status}
                      </Badge>
                    </div>
                  </AdminSelectableButton>
                );
              })}
            </AdminListPanel>
          )}
        </CardContent>
      </Card>

      <AdminDetailSheet
        open={Boolean(selectedNomination)}
        onOpenChange={(open) => !open && setSelectedNominationId(null)}
        kicker="Moderacao"
        title={selectedNomination?.title ?? ""}
        description={
          selectedNomination
            ? `Categoria atual: ${getCategoryName(selectedNomination.categoryId, categories)}`
            : undefined
        }
      >
        {selectedNomination ? (
          <>
            <AdminDetailPanel>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-[var(--font-mono)] text-xs text-[var(--text-muted)]">
                    {formatDateTimeUtc(selectedNomination.createdAtUtc)}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-[rgba(245,237,224,0.82)]">
                    <User className="h-3.5 w-3.5" />
                    Submetido por {selectedNomination.submittedByName}
                  </p>
                </div>
                <Badge variant={NOMINATION_BADGE_VARIANT_BY_STATUS[selectedNomination.status]}>
                  {selectedNomination.status}
                </Badge>
              </div>
            </AdminDetailPanel>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--color-text-muted)]">
                Mover para categoria
              </p>
              <Select
                value={selectedNomination.categoryId ?? "none"}
                onValueChange={(value) =>
                  setCategory.mutate({
                    nomineeId: selectedNomination.id,
                    categoryId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mover para categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                disabled={anyMutationPending || selectedNomination.status === "approved"}
                className="border-[var(--border-neon)] bg-[rgba(0,255,136,0.12)] text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.18)]"
                onClick={() => approveNomination.mutate(selectedNomination.id)}
              >
                Aprovar
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={anyMutationPending || selectedNomination.status === "rejected"}
                className="border-[var(--neon-red)] bg-[rgba(255,58,58,0.08)] text-[var(--neon-red)]"
                onClick={() => setRejectingNominationId(selectedNomination.id)}
              >
                Rejeitar
              </Button>
            </div>
          </>
        ) : null}
      </AdminDetailSheet>

      <AlertDialog
        open={Boolean(rejectingNominationId)}
        onOpenChange={(open) => !open && setRejectingNominationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acao remove a nomeacao da lista publica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!rejectingNominationId) return;
                rejectNomination.mutate(rejectingNominationId);
              }}
            >
              Confirmar rejeicao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
