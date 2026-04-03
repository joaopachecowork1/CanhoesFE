"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { toast } from "sonner";

import type { EventCategoryDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
import { useEventOverview } from "@/hooks/useEventOverview";
import {
    CanhoesModuleHeader,
    formatEventPhaseLabel,
} from "@/components/modules/canhoes/CanhoesModuleParts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CanhoesCategoriesModule() {
    const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
    const [categoryList, setCategoryList] = useState<EventCategoryDto[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadCategories = useCallback(async () => {
        if (!event) {
            setCategoryList([]);
            setErrorMessage(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            setCategoryList(await canhoesEventsRepo.getCategories(event.id));
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Nao foi possivel carregar as categorias desta edicao."
            );
            logFrontendError("CanhoesCategories.loadCategories", error, { eventId: event.id });
            setCategoryList([]);
            setErrorMessage(message);
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
            toast.success("Proposta enviada");
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Nao foi possivel enviar a proposta de categoria."
            );
            logFrontendError("CanhoesCategories.handleProposalSubmit", error, {
                eventId: event.id,
            });
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <CanhoesModuleHeader
                icon={Flame}
                title="Categorias"
                description="Propoe novas categorias enquanto as nomeacoes estiverem abertas."
                badgeLabel={
                    overview
                        ? `Fase: ${formatEventPhaseLabel(overview.activePhase?.type)}`
                        : undefined
                }
            />

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
                    {errorMessage ? (
                        <ErrorAlert
                            title="Erro ao carregar categorias"
                            description={errorMessage}
                            actionLabel="Tentar novamente"
                            onAction={() => void loadCategories()}
                        />
                    ) : null}

                    {isLoading || isOverviewLoading ? (
                        <p className="body-small text-[var(--color-text-muted)]">A carregar...</p>
                    ) : null}

                    {!isLoading && !isOverviewLoading && !errorMessage && categoryList.length === 0 ? (
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
