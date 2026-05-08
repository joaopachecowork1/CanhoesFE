"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useState } from "react";
import { Flame, Inbox, Search, Trophy } from "lucide-react";
import { toast } from "sonner";

import type { AwardCategoryDto } from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { awardsRepo } from "@/lib/repositories/awardsRepo";
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

function CategoriesLoadingState() {
    return (
        <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                >
                    <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
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
    const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
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
            const result = await awardsRepo.getCategories(currentEventId);
            setCategoryList(result.items);
        } catch (error) {
            const message = getErrorMessage(
                error,
                "Não foi possível carregar as categorias desta edição."
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
            await awardsRepo.createCategoryProposal(event.id, {
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
                "Não foi possível enviar a proposta de categoria."
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
        <div className="space-y-5">
            {/* ── Sticky header com backdrop blur ── */}
            <div className="sticky top-0 z-10 -mx-4 px-4 pb-4 pt-2 backdrop-blur-xl bg-[var(--bg-void)]/80 border-b border-white/5">
                <CanhoesModuleHeader
                    icon={Flame}
                    title="Categorias oficiais"
                    description="Consulta as categorias oficiais e propõe novas enquanto a fase de propostas estiver aberta."
                    badgeLabel={
                        overview
                            ? `Fase: ${formatEventPhaseLabel(overview.activePhase?.type)}`
                            : undefined
                    }
                />
            </div>

            {/* ── Propor categoria ── */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-fire)]/12">
                            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
                        </div>
                        Propor categoria oficial
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
                        <p className="canhoes-helper-text">A proposta entra em revisão antes de ficar oficial.</p>
                        <Button disabled={!canSubmitProposal || isSubmitting} onClick={() => void handleProposalSubmit()}>
                            {submitButtonLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Lista de categorias ── */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Categorias oficiais</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {/* Search com ícone */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)] pointer-events-none" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Procurar categoria oficial"
                            className="h-10 pl-9"
                        />
                    </div>

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
                            description="Ainda não há categorias oficiais nesta edição."
                            tone="official"
                        />
                    ) : null}

                    {filteredCategoryList.length > 0 ? (
                        <div className="space-y-2.5">
                            {filteredCategoryList.map((category, index) => (
                                <div
                                    key={category.id}
                                    className="flex items-center gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] animate-fade-slide-up"
                                    style={{ "--item-index": index } as CSSProperties}
                                >
                                    {/* Ícone translúcido */}
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--moss)]/12">
                                        <Trophy className="h-5 w-5 text-[var(--moss-glow)]" />
                                    </div>

                                    {/* Conteúdo textual */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[var(--ink-primary)]">
                                            {category.name}
                                        </p>
                                        <p className="mt-0.5 truncate text-xs text-[var(--ink-secondary)]">
                                            {category.description || "Sem descrição adicional."}
                                        </p>
                                    </div>

                                    {/* Badge de estado */}
                                    <Badge variant={category.isActive ? "default" : "outline"}>
                                        {category.isActive ? "Ativa" : "Inativa"}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {filteredCategoryList.length > 0 ? (
                        <CanhoesDecorativeDivider tone="moss" />
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
