"use client";

import { useMemo, useState, useCallback } from "react";
import { FolderTree, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type {
  AdminNomineeDto,
  AdminVoteAuditRowDto,
  AwardCategoryDto,
  CreateAwardCategoryRequest,
  UpdateAwardCategoryRequest,
} from "@/lib/api/types";
import { getErrorMessage } from "@/lib/errors";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VirtualizedList } from "@/components/ui/virtualized-list";

import { AdminSectionSummary } from "./AdminSectionSummary";
import { AdminStateMessage } from "./AdminStateMessage";
import { ADMIN_CONTENT_CARD_CLASS } from "./adminContentUi";
import { CategoryEditorSheet } from "./CategoryEditorSheet";
import { CategoryListItem } from "./CategoryListItem";

type CategoriesAdminProps = {
  adminNominees: AdminNomineeDto[];
  categories: AwardCategoryDto[];
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
  votes: AdminVoteAuditRowDto[];
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

export function CategoriesAdmin({
  adminNominees,
  categories,
  eventId,
  loading,
  onUpdate,
  votes,
}: Readonly<CategoriesAdminProps>) {
  const [sheetState, setSheetState] = useState<CategorySheetState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AwardCategoryDto | null>(null);
  const [form, setForm] = useState<CategoryFormState>(() => buildInitialForm(1));

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
    const nomineeCounts = adminNominees.reduce<Record<string, number>>((acc, nominee) => {
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
  }, [adminNominees, sortedCategories, votes]);

  const createCategory = useMutation({
    mutationFn: (payload: CreateAwardCategoryRequest) =>
      canhoesEventsRepo.adminCreateCategory(eventId!, payload),
    onSuccess: async () => {
      toast.success("Categoria criada.");
      setSheetState(null);
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
    onSuccess: async () => {
      toast.success("Categoria atualizada.");
      setSheetState(null);
      await onUpdate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar a categoria."));
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (categoryId: string) => canhoesEventsRepo.adminDeleteCategory(eventId!, categoryId),
    onSuccess: async () => {
      toast.success("Categoria apagada.");
      setDeleteTarget(null);
      setSheetState(null);
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
              <p className="text-sm text-[var(--text-muted)]">
                Toca numa categoria para editar, rever dependências e ajustar o estado sem sair do contexto admin.
              </p>
            </div>

            <Button type="button" onClick={openCreateSheet} className="min-h-11 gap-2 sm:self-start" disabled={isBusy}>
              <Plus className="h-4 w-4" />
              Nova categoria
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? <AdminStateMessage>A carregar categorias...</AdminStateMessage> : null}

          {!loading && sortedCategories.length === 0 ? (
            <AdminStateMessage variant="panel">
              Ainda nao existem categorias oficiais nesta edicao.
            </AdminStateMessage>
          ) : null}

          {!loading && sortedCategories.length > 0 ? (
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

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
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
            <AlertDialogAction
              disabled={deleteCategory.isPending}
              onClick={() => {
                if (!deleteTarget) return;
                deleteCategory.mutate(deleteTarget.id);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
