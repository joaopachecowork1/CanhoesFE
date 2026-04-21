"use client";

import { useCallback, useMemo, useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  AwardCategoryDto,
  CreateAwardCategoryRequest,
  UpdateAwardCategoryRequest,
} from "@/lib/api/types";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VirtualizedList } from "@/components/ui/virtualized-list";

const EMPTY_AWARD_CATEGORIES: AwardCategoryDto[] = [];
const EMPTY_ADMIN_NOMINATIONS_SUMMARY = [] as Awaited<ReturnType<typeof canhoesEventsRepo.getAdminNominationsSummary>>;
const EMPTY_ADMIN_VOTES = [] as Awaited<ReturnType<typeof canhoesEventsRepo.loadAllAdminVotes>>;

import { AdminSectionSummary } from "./AdminSectionSummary";
import { AdminStateMessage } from "./AdminStateMessage";
import {
  ADMIN_CONTENT_CARD_CLASS,
  ADMIN_OUTLINE_BUTTON_CLASS,
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_ITEM_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
  AdminDetailPanel,
  AdminDetailSheet,
} from "./adminContentUi";

type CategoriesAdminProps = {
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type CategoryFormState = {
  description: string;
  isActive: boolean;
  kind: AwardCategoryDto["kind"];
  name: string;
  sortOrder: string;
  voteQuestion: string;
  voteRules: string;
};

type CategoryFormPatch = Partial<CategoryFormState>;

type CategorySheetState =
  | { mode: "create" }
  | { category: AwardCategoryDto; mode: "edit" };

type CategoryUsage = {
  canDelete: boolean;
  deleteReason: string | null;
  nomineeCount: number;
  voteCount: number;
};

const CATEGORY_KIND_LABELS: Record<AwardCategoryDto["kind"], string> = {
  Sticker: "Sticker",
  UserVote: "Voto oficial",
};

function buildInitialForm(sortOrder: number): CategoryFormState {
  return {
    description: "",
    isActive: true,
    kind: "Sticker",
    name: "",
    sortOrder: String(sortOrder),
    voteQuestion: "",
    voteRules: "",
  };
}

function buildFormFromCategory(category: AwardCategoryDto): CategoryFormState {
  return {
    description: category.description ?? "",
    isActive: category.isActive,
    kind: category.kind,
    name: category.name,
    sortOrder: String(category.sortOrder),
    voteQuestion: category.voteQuestion ?? "",
    voteRules: category.voteRules ?? "",
  };
}

function toOptionalString(value: string) {
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function parseSortOrder(value: string) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function buildCreatePayload(form: Readonly<CategoryFormState>): CreateAwardCategoryRequest {
  return {
    name: form.name.trim(),
    sortOrder: parseSortOrder(form.sortOrder),
    kind: form.kind,
    description: toOptionalString(form.description),
    voteQuestion: form.kind === "UserVote" ? toOptionalString(form.voteQuestion) : null,
    voteRules: form.kind === "UserVote" ? toOptionalString(form.voteRules) : null,
  };
}

function buildUpdatePayload(form: Readonly<CategoryFormState>): UpdateAwardCategoryRequest {
  return {
    name: form.name.trim(),
    sortOrder: parseSortOrder(form.sortOrder),
    isActive: form.isActive,
    kind: form.kind,
    description: toOptionalString(form.description),
    voteQuestion: form.kind === "UserVote" ? toOptionalString(form.voteQuestion) : null,
    voteRules: form.kind === "UserVote" ? toOptionalString(form.voteRules) : null,
  };
}

const CATEGORY_ITEM_CLASS =
  "w-full min-h-11 rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-paper-soft)]";

function CategoryListItem({
  category,
  onEdit,
  usage,
}: Readonly<{
  category: AwardCategoryDto;
  onEdit: (category: AwardCategoryDto) => void;
  usage: CategoryUsage;
}>) {
  return (
    <button type="button" onClick={() => onEdit(category)} className={CATEGORY_ITEM_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">{category.name}</p>
            <Badge variant="secondary">{CATEGORY_KIND_LABELS[category.kind]}</Badge>
            <Badge variant={category.isActive ? "default" : "outline"}>{category.isActive ? "Ativa" : "Inativa"}</Badge>
          </div>

          {category.description ? (
            <p className="text-sm leading-6 text-[var(--ink-muted)]">{category.description}</p>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">Sem descrição editorial definida.</p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.08em] text-[var(--ink-muted)]">
            <span>Ordem {category.sortOrder}</span>
            <span>{usage.nomineeCount} nomeações</span>
            <span>{usage.voteCount} votos</span>
            {category.kind === "UserVote" && category.voteQuestion ? <span className="normal-case tracking-normal">{category.voteQuestion}</span> : null}
          </div>
        </div>

        <span className="mt-0.5 shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] p-2 text-[var(--ink-muted)]">
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

function CategoryList({
  categories,
  categoryUsageById,
  onEdit,
}: Readonly<{
  categories: AwardCategoryDto[];
  categoryUsageById: Record<string, CategoryUsage>;
  onEdit: (category: AwardCategoryDto) => void;
}>) {
  const renderItem = useCallback(
    (category: AwardCategoryDto) => (
      <CategoryListItem
        category={category}
        onEdit={onEdit}
        usage={categoryUsageById[category.id]}
      />
    ),
    [categoryUsageById, onEdit]
  );

  if (categories.length > 10) {
    return (
      <VirtualizedList
        items={categories}
        estimateSize={() => 88}
        getKey={(category) => category.id}
        className="max-h-[400px]"
        renderItem={renderItem}
      />
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <CategoryListItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          usage={categoryUsageById[category.id]}
        />
      ))}
    </div>
  );
}

function formatKnownDependencyCount(label: string, count: number) {
  if (count === 0) return null;
  return `${count} ${label}${count > 1 ? "s" : ""}`;
}

function buildCategoryUsage(
  category: AwardCategoryDto,
  nomineeCount: number,
  voteCount: number
): CategoryUsage {
  const knownDependencyCount = nomineeCount + voteCount;

  if (knownDependencyCount > 0) {
    const parts = [
      formatKnownDependencyCount("nomeação", nomineeCount),
      formatKnownDependencyCount("voto", voteCount),
    ].filter(Boolean);

    return {
      canDelete: false,
      deleteReason: `Apagamento bloqueado por ${parts.join(" e ")} já associados.`,
      nomineeCount,
      voteCount,
    };
  }

  if (category.kind === "UserVote") {
    return {
      canDelete: false,
      deleteReason:
        "Categorias de voto oficial ficam protegidas aqui; a validação final de votos continua no backend.",
      nomineeCount,
      voteCount,
    };
  }

  return {
    canDelete: true,
    deleteReason: null,
    nomineeCount,
    voteCount,
  };
}

function CategoryEditorSheet({
  categoryUsage,
  form,
  isBusy,
  onChange,
  onDelete,
  onOpenChange,
  onSave,
  sheetState,
}: Readonly<{
  categoryUsage: CategoryUsage;
  form: CategoryFormState;
  isBusy: boolean;
  onChange: (patch: CategoryFormPatch) => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  sheetState: CategorySheetState | null;
}>) {
  const isCreateMode = sheetState?.mode === "create";
  const title = isCreateMode ? "Nova categoria" : form.name || "Editar categoria";
  const description = isCreateMode
    ? "Cria a categoria oficial sem sair do contexto mobile."
    : "Atualiza nome, ordem, tipo e estado da categoria selecionada.";

  return (
    <AdminDetailSheet
      open={Boolean(sheetState)}
      onOpenChange={onOpenChange}
      kicker="Categorias"
      title={title}
      description={description}
    >
      {sheetState ? (
        <>
          {!isCreateMode ? (
            <AdminDetailPanel className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {categoryUsage.nomineeCount} nomeaç{categoryUsage.nomineeCount === 1 ? "ão" : "ões"}
                </Badge>
                <Badge variant="secondary">
                  {categoryUsage.voteCount} voto{categoryUsage.voteCount === 1 ? "" : "s"}
                </Badge>
              </div>
              {categoryUsage.deleteReason ? (
                <p className="text-xs leading-5 text-[var(--ink-muted)]">
                  {categoryUsage.deleteReason}
                </p>
              ) : (
                <p className="text-xs leading-5 text-[var(--ink-muted)]">
                  Sem dependências conhecidas. O backend confirma o apagamento final.
                </p>
              )}
            </AdminDetailPanel>
          ) : null}

          <div className="space-y-2 pt-1">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={form.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Melhor categoria do ano"
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Descricao</Label>
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(event) => onChange({ description: event.target.value })}
              placeholder="Resumo curto para contexto editorial."
              rows={3}
              disabled={isBusy}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category-sort-order">Ordem</Label>
              <Input
                id="category-sort-order"
                type="number"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(event) => onChange({ sortOrder: event.target.value })}
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={form.kind}
                onValueChange={(value: AwardCategoryDto["kind"]) => onChange({ kind: value })}
                disabled={isBusy}
              >
                <SelectTrigger className={ADMIN_SELECT_TRIGGER_CLASS}>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
                  <SelectItem value="Sticker" className={ADMIN_SELECT_ITEM_CLASS}>
                    Sticker
                  </SelectItem>
                  <SelectItem value="UserVote" className={ADMIN_SELECT_ITEM_CLASS}>
                    Voto oficial
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.kind === "UserVote" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-vote-question">Pergunta de voto</Label>
                <Input
                  id="category-vote-question"
                  value={form.voteQuestion}
                  onChange={(event) => onChange({ voteQuestion: event.target.value })}
                  placeholder="Quem fechou o ano em alta?"
                  disabled={isBusy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-vote-rules">Regras</Label>
                <Textarea
                  id="category-vote-rules"
                  value={form.voteRules}
                  onChange={(event) => onChange({ voteRules: event.target.value })}
                  placeholder="Notas internas para a votacao oficial."
                  rows={4}
                  disabled={isBusy}
                />
              </div>
            </div>
          ) : null}

          {!isCreateMode ? (
            <AdminDetailPanel className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--ink-primary)]">Categoria ativa</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  Desativa a categoria sem a apagar da auditoria.
                </p>
              </div>

              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => onChange({ isActive: checked })}
                disabled={isBusy}
              />
            </AdminDetailPanel>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4">
            {!isCreateMode ? (
              categoryUsage.canDelete ? (
                <Button
                  type="button"
                  variant="outline"
                  className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full gap-2 border-[rgba(255,96,96,0.22)] text-[var(--danger)] sm:w-auto`}
                  onClick={onDelete}
                  disabled={isBusy}
                >
                  <Trash2 className="h-4 w-4" />
                  Apagar categoria
                </Button>
              ) : (
                <p className="text-xs leading-5 text-[var(--ink-muted)]">
                  Apagamento indisponível nesta categoria.
                </p>
              )
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
                className={`${ADMIN_OUTLINE_BUTTON_CLASS} w-full sm:w-auto`}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={isBusy || form.name.trim().length === 0}
                className="w-full sm:w-auto"
              >
                {isCreateMode ? "Criar categoria" : "Guardar alteracoes"}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </AdminDetailSheet>
  );
}

export function CategoriesAdmin({
  eventId,
  loading,
  onUpdate,
}: Readonly<CategoriesAdminProps>) {
  const queryClient = useQueryClient();
  const [sheetState, setSheetState] = useState<CategorySheetState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AwardCategoryDto | null>(null);
  const [form, setForm] = useState<CategoryFormState>(() => buildInitialForm(1));

  const categoriesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.adminGetCategories(eventId!),
    queryKey: ["canhoes", "admin", "categories", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const nominationsSummaryQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.getAdminNominationsSummary(eventId!),
    queryKey: ["canhoes", "admin", "nominations-summary", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const votesQuery = useQuery({
    enabled: Boolean(eventId),
    queryFn: () => canhoesEventsRepo.loadAllAdminVotes(eventId!),
    queryKey: ["canhoes", "admin", "votes", eventId],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
  });

  const categories = categoriesQuery.data ?? EMPTY_AWARD_CATEGORIES;
  const nominationsSummary = nominationsSummaryQuery.data ?? EMPTY_ADMIN_NOMINATIONS_SUMMARY;
  const votes = votesQuery.data ?? EMPTY_ADMIN_VOTES;

  const sortedCategories = useMemo(
    () =>
      [...categories].sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, "pt-PT")
      ),
    [categories]
  );

  const activeCategoriesCount = sortedCategories.filter((category) => category.isActive).length;
  const inactiveCategoriesCount = sortedCategories.length - activeCategoriesCount;
  const userVoteCategoriesCount = sortedCategories.filter(
    (category) => category.kind === "UserVote"
  ).length;

  const categoryUsageById = useMemo(() => {
    const nomineeCounts = nominationsSummary.reduce<Record<string, number>>((acc, nominee) => {
      if (!nominee.categoryId) return acc;
      acc[nominee.categoryId] = (acc[nominee.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    const voteCounts = votes.reduce<Record<string, number>>((acc, vote) => {
      acc[vote.categoryId] = (acc[vote.categoryId] ?? 0) + 1;
      return acc;
    }, {});

    return Object.fromEntries(
      sortedCategories.map((category) => [
        category.id,
        buildCategoryUsage(
          category,
          nomineeCounts[category.id] ?? 0,
          voteCounts[category.id] ?? 0
        ),
      ])
    ) as Record<string, CategoryUsage>;
  }, [nominationsSummary, sortedCategories, votes]);

  const isLoading = loading || categoriesQuery.isLoading || nominationsSummaryQuery.isLoading || votesQuery.isLoading;
  const queryError = categoriesQuery.error ?? nominationsSummaryQuery.error ?? votesQuery.error;

  const createCategory = useMutation({
    mutationFn: (payload: CreateAwardCategoryRequest) =>
      canhoesEventsRepo.adminCreateCategory(eventId!, payload),
    onSuccess: async (createdCategory) => {
      queryClient.setQueryData<AwardCategoryDto[]>(["canhoes", "admin", "categories", eventId], (current) =>
        current ? [...current, createdCategory] : [createdCategory]
      );
      toast.success("Categoria criada.");
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "nominations-summary", eventId], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "votes", eventId], exact: true }),
      ]);
      await onUpdate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel criar a categoria."));
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateAwardCategoryRequest;
    }) => canhoesEventsRepo.adminUpdateCategory(eventId!, categoryId, payload),
    onSuccess: async (updatedCategory) => {
      queryClient.setQueryData<AwardCategoryDto[]>(["canhoes", "admin", "categories", eventId], (current) =>
        current?.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)) ?? [updatedCategory]
      );
      toast.success("Categoria atualizada.");
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "nominations-summary", eventId], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "votes", eventId], exact: true }),
      ]);
      await onUpdate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar a categoria."));
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (categoryId: string) => canhoesEventsRepo.adminDeleteCategory(eventId!, categoryId),
    onSuccess: async (_data, categoryId) => {
      queryClient.setQueryData<AwardCategoryDto[]>(["canhoes", "admin", "categories", eventId], (current) =>
        current?.filter((category) => category.id !== categoryId) ?? []
      );
      toast.success("Categoria apagada.");
      setDeleteTarget(null);
      setSheetState(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "nominations-summary", eventId], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["canhoes", "admin", "votes", eventId], exact: true }),
      ]);
      await onUpdate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel apagar a categoria."));
    },
  });

  const isBusy =
    createCategory.isPending || updateCategory.isPending || deleteCategory.isPending;

  const patchForm = (patch: CategoryFormPatch) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const openCreateSheet = () => {
    setForm(buildInitialForm(sortedCategories.length + 1));
    setSheetState({ mode: "create" });
  };

  const openEditSheet = (category: AwardCategoryDto) => {
    setForm(buildFormFromCategory(category));
    setSheetState({ mode: "edit", category });
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (open) return;
    setSheetState(null);
  };

  const handleSave = () => {
    if (!eventId) return;

    if (sheetState?.mode === "edit") {
      updateCategory.mutate({
        categoryId: sheetState.category.id,
        payload: buildUpdatePayload(form),
      });
      return;
    }

    createCategory.mutate(buildCreatePayload(form));
  };

  const activeCategoryUsage =
    sheetState?.mode === "edit"
      ? categoryUsageById[sheetState.category.id]
      : { canDelete: false, deleteReason: null, nomineeCount: 0, voteCount: 0 };

  if (!eventId) {
    return <AdminStateMessage>Falta uma edicao ativa para gerir categorias.</AdminStateMessage>;
  }

  if (queryError) {
    logFrontendError("CategoriesAdmin.query", queryError, { eventId });
    return (
      <AdminStateMessage
        tone="error"
        action={
          <Button
            type="button"
            onClick={() => void Promise.all([
              categoriesQuery.refetch(),
              nominationsSummaryQuery.refetch(),
              votesQuery.refetch(),
            ])}
            className={ADMIN_OUTLINE_BUTTON_CLASS}
          >
            Tentar novamente
          </Button>
        }
      >
        Nao foi possivel carregar as categorias.
      </AdminStateMessage>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSectionSummary
        kicker="Estrutura"
        title="Categorias oficiais"
        description="CRUD compacto para manter a grelha oficial, sem misturar moderacao ou auditoria nesta vista."
        items={[
          { label: "Categorias totais", value: sortedCategories.length },
          {
            label: "Ativas",
            tone: activeCategoriesCount > 0 ? "success" : "muted",
            value: activeCategoriesCount,
          },
          {
            label: "Inativas",
            tone: inactiveCategoriesCount > 0 ? "warning" : "muted",
            value: inactiveCategoriesCount,
          },
          { label: "Voto oficial", value: userVoteCategoriesCount },
        ]}
      />

      <Card className={ADMIN_CONTENT_CARD_CLASS}>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="editorial-kicker">Categorias</p>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Catalogo oficial
              </CardTitle>
              <p className="text-sm text-[var(--ink-muted)]">
                Toca numa categoria para editar, rever dependências e ajustar o estado sem sair do contexto admin.
              </p>
            </div>

            <Button type="button" onClick={openCreateSheet} className="min-h-11 gap-2 sm:self-start" disabled={isBusy}><Plus className="h-4 w-4" /> Nova categoria</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? <AdminStateMessage>A carregar categorias...</AdminStateMessage> : null}

          {!isLoading && sortedCategories.length === 0 ? (
            <AdminStateMessage variant="panel">
              Ainda nao existem categorias oficiais nesta edicao.
            </AdminStateMessage>
          ) : null}

          {!isLoading && sortedCategories.length > 0 ? (
            <CategoryList
              categories={sortedCategories}
              categoryUsageById={categoryUsageById}
              onEdit={openEditSheet}
            />
          ) : null}
        </CardContent>
      </Card>

      <CategoryEditorSheet
        categoryUsage={activeCategoryUsage}
        form={form}
        isBusy={isBusy}
        onChange={patchForm}
        onDelete={() => {
          if (sheetState?.mode !== "edit") return;
          setDeleteTarget(sheetState.category);
        }}
        onOpenChange={handleSheetOpenChange}
        onSave={handleSave}
        sheetState={sheetState}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Esta ação remove "${deleteTarget.name}" da edição atual.`
                : "Esta ação remove a categoria oficial da edição atual."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCategory.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleteCategory.isPending} onClick={() => {
              if (!deleteTarget) return;
              deleteCategory.mutate(deleteTarget.id);
            }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
