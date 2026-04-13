"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Lock, Trophy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { AwardCategoryDto, MyNominationStatusDto, NomineeDto } from "@/lib/api/types";
import { useEventOverview } from "@/hooks/useEventOverview";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { CanhoesModuleHeader } from "@/components/modules/canhoes/CanhoesModuleParts";
import { CompactSegmentTabs } from "@/components/modules/canhoes/CompactSegmentTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CanhoesDecorativeDivider } from "@/components/ui/canhoes-bits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FeedSkeleton } from "@/components/ui/FeedSkeleton";
import { Input } from "@/components/ui/input";

export function CanhoesNominationsModule() {
  const queryClient = useQueryClient();
  const { event, overview, isLoading: isOverviewLoading } = useEventOverview();

  const eventId = event?.id ?? null;
  const queryEventId = eventId ?? "";
  const isPhaseOpen = overview?.activePhase?.type === "PROPOSALS";

  const categoriesQuery = useQuery({
    queryKey: ["nominations", queryEventId, "categories"],
    enabled: Boolean(eventId),
    queryFn: async () => {
      const categories = await canhoesEventsRepo.getUserCategories(queryEventId);
      return categories.filter((category) => category.isActive);
    },
  });

  const myStatusQuery = useQuery({
    queryKey: ["nominations", queryEventId, "my-status"],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getMyNominationStatus(queryEventId),
  });

  const approvedQuery = useQuery({
    queryKey: ["nominations", queryEventId, "approved"],
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getApprovedNominees(queryEventId),
  });

  const isLoading = isOverviewLoading || categoriesQuery.isLoading || myStatusQuery.isLoading || approvedQuery.isLoading;
  const error = categoriesQuery.error ?? myStatusQuery.error ?? approvedQuery.error;
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const myStatus = myStatusQuery.data ?? [];
  const approvedNominees = approvedQuery.data ?? [];

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((current) => {
      if (current && categories.some((category) => category.id === current)) return current;
      return categories[0].id;
    });
  }, [categories]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CanhoesModuleHeader
          icon={Trophy}
          title="Nomeacoes oficiais"
          description="Area oficial para propor um nome por categoria durante a fase de propostas."
        />
        <FeedSkeleton />
      </div>
    );
  }

  if (!eventId || error) {
    return (
      <ErrorAlert
        title="Erro ao carregar nomeacoes oficiais"
        description={getErrorMessage(error, "Nao foi possivel carregar a area oficial de nomeacoes.")}
        actionLabel="Tentar novamente"
        tone="official"
        onAction={() => {
          void categoriesQuery.refetch();
          void myStatusQuery.refetch();
          void approvedQuery.refetch();
        }}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        className="py-8"
        icon={Trophy}
        title="Sem categorias oficiais abertas"
        description="A area oficial de nomeacoes fica disponivel quando existirem categorias ativas."
        tone="official"
      />
    );
  }

  if (!isPhaseOpen) {
    return (
      <EmptyState
        className="py-10 opacity-90"
        icon={Lock}
        title="Nomeacoes oficiais fechadas"
        description="Esta area oficial volta a abrir na fase de propostas."
        tone="official"
      />
    );
  }

  return (
    <div className="space-y-4">
      <CanhoesModuleHeader
        icon={Trophy}
        title="Nomeacoes oficiais"
        description="Cada membro pode submeter uma nomeacao oficial por categoria."
        badgeLabel={`Categorias: ${categories.length}`}
      />

      <CompactSegmentTabs
        activeId={selectedCategory?.id ?? ""}
        items={categories.map((category) => ({
          id: category.id,
          label: category.name,
          badge: myStatus.some(
            (status) => status.categoryId === category.id && status.hasNominated
          )
            ? "Enviado"
            : undefined,
        }))}
        onSelect={setSelectedCategoryId}
      />

      {selectedCategory ? (
        <CategoryNominationCard
          category={selectedCategory}
          eventId={queryEventId}
          isPhaseOpen={isPhaseOpen}
          myStatus={myStatus.find((status) => status.categoryId === selectedCategory.id)}
          approvedNominees={approvedNominees.filter((nominee) => nominee.categoryId === selectedCategory.id)}
          onRefresh={async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["nominations", queryEventId, "my-status"] }),
              queryClient.invalidateQueries({ queryKey: ["nominations", queryEventId, "approved"] }),
            ]);
          }}
        />
      ) : null}
    </div>
  );
}

function CategoryNominationCard({
  category,
  eventId,
  myStatus,
  approvedNominees,
  isPhaseOpen,
  onRefresh,
}: Readonly<{
  category: AwardCategoryDto;
  eventId: string;
  myStatus: MyNominationStatusDto | undefined;
  approvedNominees: NomineeDto[];
  isPhaseOpen: boolean;
  onRefresh: () => Promise<void>;
}>) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pendingLabel, setPendingLabel] = useState<string | null>(null);

  const titleTrimmed = title.trim();
  const isValid = titleTrimmed.length >= 2 && titleTrimmed.length <= 120;
  const alreadyNominated = Boolean(myStatus?.hasNominated || pendingLabel);
  const nominatedTitle = pendingLabel ?? myStatus?.nomineeTitle;

  const createNomination = useMutation({
    mutationFn: () =>
      canhoesEventsRepo.createNomination(eventId, {
        categoryId: category.id,
        title: titleTrimmed,
      }),
    onSuccess: async () => {
      setPendingLabel(titleTrimmed);
      setTitle("");
      setFile(null);
      toast.success("Nomeacao submetida. Aguarda aprovacao.");
      await onRefresh();
    },
    onError: (error) => {
      logFrontendError("CanhoesNominations.createNomination", error, { categoryId: category.id, eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel submeter a nomeacao."));
    },
  });

  return (
    <Card className="canhoes-bits-panel canhoes-bits-panel--official rounded-2xl">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-[var(--text-primary)]">{category.name}</CardTitle>
        {category.description ? (
          <p className="text-sm text-[var(--text-muted)]">{category.description}</p>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3">
        {alreadyNominated ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-[rgba(255,184,0,0.08)] border border-[var(--neon-amber)] text-[var(--neon-amber)]">
              <Clock className="mr-1 h-3.5 w-3.5" />
              Aguarda aprovacao
            </Badge>
            <span className="text-sm font-medium text-[var(--text-primary)]">{nominatedTitle || "Ja nomeaste nesta categoria"}</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Nome da pessoa ou item"
                className="border-[var(--border-moss)] focus-visible:border-[var(--border-neon)]"
                maxLength={120}
                disabled={!isPhaseOpen || createNomination.isPending}
              />
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>2 a 120 caracteres.</span>
                <span className="font-[var(--font-mono)]">{titleTrimmed.length}/120</span>
              </div>
              {file ? <p className="text-xs text-[var(--text-muted)]">Ficheiro selecionado: {file.name}</p> : null}
              <div className="space-y-1 text-xs text-[var(--text-muted)]">
                <label htmlFor={`nomination-file-${category.id}`}>Upload opcional</label>
                <input
                  id={`nomination-file-${category.id}`}
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  disabled={!isPhaseOpen || createNomination.isPending}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={() => createNomination.mutate()}
              disabled={!isPhaseOpen || !isValid || createNomination.isPending}
              className={cn(
                "min-w-36",
                isValid && !createNomination.isPending
                  ? "bg-[linear-gradient(180deg,rgba(0,255,136,0.18),rgba(0,212,170,0.12))] border border-[var(--border-neon)] text-[var(--neon-green)] shadow-[var(--glow-green-sm)] hover:bg-[rgba(0,255,136,0.22)] hover:shadow-[0_0_18px_rgba(0,255,136,0.18)] active:scale-[0.98]"
                  : "opacity-50"
              )}
            >
              {createNomination.isPending ? "A submeter..." : "Submeter"}
            </Button>
          </div>
        )}

        <CanhoesDecorativeDivider tone="moss" />

        <div className="pt-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--text-primary)]">Nomeacoes aprovadas</h4>
            <span className="font-[var(--font-mono)] text-xs text-[var(--text-muted)]">
              {approvedNominees.length} nominee(s)
            </span>
          </div>

          {approvedNominees.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Ainda sem nomeacoes aprovadas nesta categoria oficial.</p>
          ) : (
            <ul className="space-y-1.5">
              {approvedNominees.map((nominee, index) => (
                <li
                  key={nominee.id}
                  className="canhoes-list-item flex items-center gap-2 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.1)] px-3 py-2.5 animate-[stagger-fade-in_0.3s_ease-out_both] transition-colors duration-150 hover:border-[rgba(122,173,58,0.2)]"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--neon-green)]" />
                  <span className="truncate text-sm font-medium text-[var(--text-primary)]">{nominee.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
