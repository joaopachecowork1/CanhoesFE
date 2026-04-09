"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Inbox, Trophy } from "lucide-react";
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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InlineLoader } from "@/components/ui/inline-loader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CanhoesCategoriesModule() {
    const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
    const [categoryList, setCategoryList] = useState<EventCategoryDto[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
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
    let submitButtonLabel = "Propostas fechadas";
    if (overview?.permissions.canSubmitProposal) {
        submitButtonLabel = "Propor";
    }
    if (isSubmitting) {
        submitButtonLabel = "A enviar...";
    }

    const filteredCategoryList = categoryList.filter((category) =>
        search.trim()
            ? `${category.title} ${category.description ?? ""}`
                .toLowerCase()
                .includes(search.trim().toLowerCase())
            : true
    );

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
                title="Categorias oficiais"
                description="Consulta as categorias oficiais e propoe novas enquanto a fase de propostas estiver aberta."
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
                        Propor categoria oficial
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="category-name-input" className="canhoes-field-label">Nome</label>
                            <Input
                                id="category-name-input"
                                value={categoryName}
                                onChange={(event) => setCategoryName(event.target.value)}
                                placeholder="Ex.: Melhor sticker de sempre"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category-desc-input" className="canhoes-field-label">Descrição</label>
                            <Textarea
                                id="category-desc-input"
                                value={categoryDescription}
                                onChange={(event) => setCategoryDescription(event.target.value)}
                                placeholder="Dá contexto ao canhão..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="canhoes-helper-text">A proposta entra em revisao antes de ficar oficial.</p>
                        <Button disabled={!canSubmitProposal || isSubmitting} onClick={() => void handleProposalSubmit()}>
                            {submitButtonLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Categorias oficiais</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Procurar categoria oficial"
                        className="h-9"
                    />

                    {errorMessage ? (
                        <ErrorAlert
                            title="Erro ao carregar categorias oficiais"
                            description={errorMessage}
                            actionLabel="Tentar novamente"
                            onAction={() => void loadCategories()}
                        />
                    ) : null}

                    {(isLoading || isOverviewLoading) ? (
                        <InlineLoader label="A carregar categorias" />
                    ) : null}

                    {!isLoading && !isOverviewLoading && !errorMessage && filteredCategoryList.length === 0 ? (
                        <EmptyState icon={Inbox} title="Sem categorias oficiais" description="Ainda nao ha categorias oficiais nesta edicao." />
                    ) : null}

                    {isLoading || isOverviewLoading ? null : (
                        <div className="max-h-[46svh] space-y-2 overflow-y-auto pr-1">
                            {filteredCategoryList.map((category) => (
                                <div key={category.id} className="canhoes-list-item flex items-center justify-between gap-3 p-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                                            {category.title}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {category.description || "Sem descricao adicional."}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{category.isActive ? "Ativa" : "Inativa"}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
