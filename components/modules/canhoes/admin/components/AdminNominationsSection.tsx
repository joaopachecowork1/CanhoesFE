"use client";

import { useMemo, useState } from "react";
import { Trophy, User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AdminNomineeDto, AwardCategoryDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";
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

type StatusTab = "pending" | "approved" | "rejected";

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
  const [tab, setTab] = useState<StatusTab>("pending");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
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
    mutationFn: (nomineeId: string) => canhoesEventsRepo.adminApproveNomination(queryEventId, nomineeId),
    onSuccess: async () => {
      toast.success("Nomeacao aprovada.");
      await invalidate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel aprovar a nomeacao."));
    },
  });

  const rejectNomination = useMutation({
    mutationFn: (nomineeId: string) => canhoesEventsRepo.adminRejectNomination(queryEventId, nomineeId),
    onSuccess: async () => {
      setRejectingId(null);
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

  const rows = useMemo(() => nominationsQuery.data ?? [], [nominationsQuery.data]);

  const counts = useMemo(
    () => ({
      pending: rows.filter((row) => row.status === "pending").length,
      approved: rows.filter((row) => row.status === "approved").length,
      rejected: rows.filter((row) => row.status === "rejected").length,
    }),
    [rows]
  );

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => row.status === tab)
      .filter((row) => (categoryFilter === "all" ? true : row.categoryId === categoryFilter))
      .sort((left, right) => right.createdAtUtc.localeCompare(left.createdAtUtc));
  }, [rows, tab, categoryFilter]);

  const tabLabels: Record<StatusTab, string> = {
    pending: "Pendentes",
    approved: "Aprovadas",
    rejected: "Rejeitadas",
  };
  const emptyStateLabel: Record<StatusTab, string> = {
    pending: "pendente",
    approved: "aprovada",
    rejected: "rejeitada",
  };
  const badgeVariantByStatus: Record<AdminNomineeDto["status"], "default" | "destructive" | "secondary"> = {
    approved: "default",
    pending: "secondary",
    rejected: "destructive",
  };

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para moderar nomeacoes.</AdminStateMessage>;
  }

  if (nominationsQuery.isLoading) {
    return <AdminStateMessage>A carregar nomeacoes...</AdminStateMessage>;
  }

  if (nominationsQuery.error) {
    logFrontendError("AdminNominationsSection.query", nominationsQuery.error, { eventId });
    return (
      <AdminStateMessage tone="error" action={<Button onClick={() => void nominationsQuery.refetch()}>Tentar novamente</Button>}>
        Nao foi possivel carregar as nomeacoes.
      </AdminStateMessage>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-[var(--color-moss)]/20 bg-[rgba(16,20,11,0.9)]">
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
              const active = tab === status;
              const label = tabLabels[status];
              return (
                <Button
                  key={status}
                  size="sm"
                  variant={active ? "secondary" : "outline"}
                  className={cn(
                    active ? "border-[var(--border-neon)]" : "",
                    status === "pending" && counts.pending > 0 ? "text-[var(--neon-amber)]" : ""
                  )}
                  onClick={() => setTab(status)}
                >
                  {label}
                  <Badge className={cn("ml-2", status === "pending" && counts.pending > 0 ? "bg-[rgba(255,184,0,0.12)] text-[var(--neon-amber)] animate-pulse" : "")}>{counts[status]}</Badge>
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

          {filteredRows.length === 0 ? (
            <AdminStateMessage variant="panel">Fila limpa - nenhuma nomeacao {emptyStateLabel[tab]}.</AdminStateMessage>
          ) : (
            <div className="space-y-3">
              {filteredRows.map((row) => {
                const categoryName = categories.find((category) => category.id === row.categoryId)?.name ?? "Sem categoria";
                const isBusy = approveNomination.isPending || rejectNomination.isPending || setCategory.isPending;

                return (
                  <article key={row.id} className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.92),rgba(11,14,8,0.94))] px-4 py-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-[var(--bg-paper)]">{row.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Categoria: {categoryName}</p>
                        {/* ADMIN ONLY - nao expor ao cliente membro */}
                        <p className="font-[var(--font-mono)] text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          Submetido por: {row.submittedByName} · {new Date(row.createdAtUtc).toLocaleString("pt-PT")}
                        </p>
                      </div>
                      <Badge variant={badgeVariantByStatus[row.status]}>{row.status}</Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={isBusy || row.status === "approved"}
                        className="bg-[rgba(0,255,136,0.12)] border-[var(--border-neon)] text-[var(--neon-green)] hover:bg-[rgba(0,255,136,0.18)]"
                        onClick={() => approveNomination.mutate(row.id)}
                      >
                        Aprovar
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isBusy || row.status === "rejected"}
                        className="bg-[rgba(255,58,58,0.08)] border-[var(--neon-red)] text-[var(--neon-red)]"
                        onClick={() => setRejectingId(row.id)}
                      >
                        Rejeitar
                      </Button>

                      <div className="w-full sm:w-60 sm:ml-auto">
                        <Select
                          value={row.categoryId ?? "none"}
                          onValueChange={(value) => setCategory.mutate({ nomineeId: row.id, categoryId: value })}
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(rejectingId)} onOpenChange={(open) => !open && setRejectingId(null)}>
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
                if (!rejectingId) return;
                rejectNomination.mutate(rejectingId);
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
