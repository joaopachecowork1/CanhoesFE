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

import { CanhoesDecorativeDivider } from "@/components/ui/canhoes-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { VirtualizedList } from "@/components/ui/virtualized-list";

function CategoriesLoadingState() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="canhoes-list-item flex items-center justify-between gap-3 p-2.5">
                    <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/5 rounded" />
                        <Skeleton className="h-3 w-4/5 rounded" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            ))}
        </div>
    );
}

export function CanhoesCategoriesModule() {
    const { event, overview, isLoading: isOverviewLoading } = useEventOverview();
    const [categoryList, setCategoryList] = useState<EventCategoryDto[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadCategories = useCallback(async (currentEventId: string) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            setCategoryList(await canhoesEventsRepo.getCategories(currentEventId));
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Nao foi possivel carregar as categorias desta edicao."
            );
            logFrontendError("CanhoesCategories.loadCategories", error, { eventId: currentEventId });
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCategoryList([]);
        setErrorMessage(null);
        setSearch("");
        setCategoryName("");
        setCategoryDescription("");

        if (!event) {
            setIsLoading(false);
            return;
        }

        void loadCategories(event.id);
    }, [event, loadCategories]);

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
            ? `${category.name} ${category.description ?? ""}`
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
            await loadCategories(event.id);
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

            <Card className="canhoes-bits-panel canhoes-bits-panel--official">
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

            <Card className="canhoes-bits-panel canhoes-bits-panel--official">
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
                            tone="official"
                            onAction={() => void (event ? loadCategories(event.id) : Promise.resolve())}
                        />
                    ) : null}

                    {isLoading && filteredCategoryList.length === 0 ? (
                        <CategoriesLoadingState />
                    ) : null}

                    {!isLoading && !isOverviewLoading && !errorMessage && filteredCategoryList.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="Sem categorias oficiais"
                            description="Ainda nao ha categorias oficiais nesta edicao."
                            tone="official"
                        />
                    ) : null}

                    {filteredCategoryList.length > 0 ? (
                        <VirtualizedList
                            items={filteredCategoryList}
                            getKey={(category) => category.id}
                            estimateSize={() => 88}
                            className="max-h-[46svh]"
                            renderItem={(category) => (
                                <div className="canhoes-list-item flex items-center justify-between gap-3 p-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                                            {category.name}
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)]">
                                            {category.description || "Sem descricao adicional."}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{category.isActive ? "Ativa" : "Inativa"}</Badge>
                                </div>
                            )}
                        />
                    ) : null}

                    {filteredCategoryList.length > 0 ? (
                        <CanhoesDecorativeDivider tone="moss" />
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
