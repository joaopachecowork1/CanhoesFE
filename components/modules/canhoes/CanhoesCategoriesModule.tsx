"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";

import type { EventCategoryDto, EventPhaseDto } from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useEventOverview } from "@/hooks/useEventOverview";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function formatPhaseLabel(phaseType?: EventPhaseDto["type"]) {
  switch (phaseType) {
    case "DRAW":
      return "Sorteio";
    case "PROPOSALS":
      return "Propostas";
    case "VOTING":
      return "Votacao";
    case "RESULTS":
      return "Resultados";
    default:
      return "Desconhecida";
  }
}

export function CanhoesCategoriesModule() {
  const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
  const [categoryList, setCategoryList] = useState<EventCategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    if (!event) {
      setCategoryList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      setCategoryList(await canhoesEventsRepo.getCategories(event.id));
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const canSubmitProposal =
    categoryName.trim().length >= 3 && Boolean(overview?.permissions.canSubmitProposal);
  const submitButtonLabel = overview?.permissions.canSubmitProposal
    ? isSubmitting
      ? "A enviar..."
      : "Propor"
    : "Propostas fechadas";

  const handleProposalSubmit = async () => {
    if (!canSubmitProposal || !event) return;

    setIsSubmitting(true);
    try {
      await canhoesEventsRepo.createProposal(event.id, {
        description: categoryDescription.trim() || null,
        name: categoryName.trim(),
      });

      setCategoryName("");
      setCategoryDescription("");
      await loadCategories();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--color-fire)]" />
            Categorias
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Propõe novas categorias enquanto as nomeações estiverem abertas.
          </p>
        </div>

        {overview ? (
          <Badge variant="outline">Fase: {formatPhaseLabel(overview.activePhase?.type)}</Badge>
        ) : null}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
            Propor categoria
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="canhoes-field-label">Nome</span>
              <Input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Ex.: Melhor sticker de sempre"
              />
            </label>

            <label className="space-y-2">
              <span className="canhoes-field-label">Descrição</span>
              <Textarea
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
                placeholder="Dá contexto ao canhão..."
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="canhoes-helper-text">A proposta fica pendente até aprovação de um admin.</p>
            <Button disabled={!canSubmitProposal || isSubmitting} onClick={() => void handleProposalSubmit()}>
              {submitButtonLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Categorias ativas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading || isOverviewLoading ? (
            <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
          ) : null}

          {!isLoading && !isOverviewLoading && categoryList.length === 0 ? (
            <p className="body-small text-[var(--color-text-muted)]">Ainda não há categorias.</p>
          ) : null}

          {!isLoading && !isOverviewLoading
            ? categoryList.map((category) => (
                <div key={category.id} className="canhoes-list-item flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--color-text-primary)]">
                      {category.title}
                    </p>
                    <p className="body-small text-[var(--color-text-muted)]">
                      {category.description || "Sem descricao adicional."}
                    </p>
                  </div>
                  <Badge variant="secondary">{category.isActive ? "Ativa" : "Inativa"}</Badge>
                </div>
              ))
            : null}
        </CardContent>
      </Card>
    </div>
  );
}
