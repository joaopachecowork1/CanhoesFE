"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Layers3, Trophy, User, XCircle } from "lucide-react";
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
import { VirtualizedList } from "@/components/ui/virtualized-list";
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
  ADMIN_OUTLINE_BUTTON_CLASS,
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_ITEM_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
  AdminDetailPanel,
  AdminDetailSheet,
  AdminSelectableButton,
} from "./adminContentUi";

type NominationStatus = "pending" | "approved" | "rejected";
type NominationListFilter = "all" | NominationStatus;

const NOMINATION_STATUS_LABELS: Record<NominationListFilter, string> = {
  all: "Todas",
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

function getNominationStatusIcon(status: NominationStatus) {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "rejected":
      return <XCircle className="h-3.5 w-3.5" />;
    case "pending":
    default:
      return <Layers3 className="h-3.5 w-3.5" />;
  }
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
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((nomination) => nomination.status === "pending");
      return hasPending ? 30_000 : false;
    },
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
        action={
          <Button
            onClick={() => void nominationsQuery.refetch()}
            className={ADMIN_OUTLINE_BUTTON_CLASS}
          >
            Tentar novamente
          </Button>
        }
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
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((status) => {
                const isActive = statusFilter === status;
                const badgeCount =
                  status === "all"
                    ? nominations.length
                    : statusCounts[status as NominationStatus];

                return (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    className={cn(
                      ADMIN_OUTLINE_BUTTON_CLASS,
                      "min-h-10 rounded-full",
                      isActive ? "border-[var(--border-neon)] bg-[rgba(122,173,58,0.12)]" : "",
                      status === "pending" && statusCounts.pending > 0
                        ? "text-[var(--neon-amber)]"
                        : ""
                    )}
                    onClick={() => setStatusFilter(status)}
                  >
                    {NOMINATION_STATUS_LABELS[status]}
                    <Badge
                      className={cn(
                        "ml-2",
                        status === "pending" && statusCounts.pending > 0
                          ? "animate-pulse bg-[rgba(255,184,0,0.12)] text-[var(--neon-amber)]"
                          : ""
                      )}
                    >
                      {badgeCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            <div className="w-full">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                  <SelectValue placeholder="Filtrar categoria" />
                </SelectTrigger>
                <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
                  <SelectItem value="all" className={ADMIN_SELECT_ITEM_CLASS}>
                    Todas as categorias
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className={ADMIN_SELECT_ITEM_CLASS}
                    >
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
              {statusFilter === "all" ? "disponivel neste filtro" : NOMINATION_EMPTY_STATE_LABELS[statusFilter]}.
            </AdminStateMessage>
          ) : (
            <div className="max-h-[56svh] rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] p-2">
              <VirtualizedList
                className="px-0 py-0"
                estimateSize={() => 72}
                items={filteredNominations}
                renderItem={(nomination) => {
                  const isSelected = nomination.id === selectedNominationId;
                  const categoryName = getCategoryName(nomination.categoryId, categories);

                  return (
                    <AdminSelectableButton
                      type="button"
                      onClick={() => setSelectedNominationId(nomination.id)}
                      selected={isSelected}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">
                            {nomination.title}
                          </p>
                          <p className="truncate text-xs text-[var(--ink-muted)]">
                            {categoryName}
                          </p>
                          <p className="text-[11px] text-[var(--ink-muted)]">
                            {formatDateTimeUtc(nomination.createdAtUtc)}
                          </p>
                        </div>
                        <Badge
                          variant={NOMINATION_BADGE_VARIANT_BY_STATUS[nomination.status]}
                          className="inline-flex items-center gap-1"
                        >
                          {getNominationStatusIcon(nomination.status)}
                          {nomination.status}
                        </Badge>
                      </div>
                    </AdminSelectableButton>
                  );
                }}
              />
            </div>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="font-[var(--font-mono)] text-xs text-[var(--ink-muted)]">
                    {formatDateTimeUtc(selectedNomination.createdAtUtc)}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-[var(--ink-primary)]">
                    <User className="h-3.5 w-3.5" />
                    Submetido por {selectedNomination.submittedByName}
                  </p>
                </div>
                <Badge
                  variant={NOMINATION_BADGE_VARIANT_BY_STATUS[selectedNomination.status]}
                  className="inline-flex items-center gap-1 self-start"
                >
                  {getNominationStatusIcon(selectedNomination.status)}
                  {selectedNomination.status}
                </Badge>
              </div>
            </AdminDetailPanel>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--ink-muted)]">
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
                <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                  <SelectValue placeholder="Mover para categoria" />
                </SelectTrigger>
                <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
                  <SelectItem value="none" className={ADMIN_SELECT_ITEM_CLASS}>
                    Sem categoria
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className={ADMIN_SELECT_ITEM_CLASS}
                    >
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
                className="min-h-11 border-[var(--border-neon)] bg-[rgba(0,255,136,0.12)] text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.18)]"
                onClick={() => approveNomination.mutate(selectedNomination.id)}
                aria-label={`Aprovar nomeação "${selectedNomination.title || selectedNomination.id}"`}
              >
                Aprovar
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={anyMutationPending || selectedNomination.status === "rejected"}
                className="min-h-11 border-[var(--neon-red)] bg-[rgba(255,58,58,0.08)] text-[var(--neon-red)]"
                onClick={() => setRejectingNominationId(selectedNomination.id)}
                aria-label={`Rejeitar nomeação "${selectedNomination.title || selectedNomination.id}"`}
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
