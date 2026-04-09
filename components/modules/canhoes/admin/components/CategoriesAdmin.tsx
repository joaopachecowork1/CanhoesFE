"use client";

import { useMemo, useState } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
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

import { AdminSectionSummary } from "./AdminSectionSummary";
import { AdminStateMessage } from "./AdminStateMessage";
import {
  ADMIN_CONTENT_CARD_CLASS,
  AdminDetailPanel,
  AdminDetailSheet,
} from "./adminContentUi";

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

type CategoryUsage = {
  canDelete: boolean;
  deleteReason: string | null;
  nomineeCount: number;
  voteCount: number;
};

type CategorySheetState =
  | { mode: "create" }
  | { category: AwardCategoryDto; mode: "edit" };

type CategoryEditorSheetProps = {
  categoryUsage: CategoryUsage;
  form: CategoryFormState;
  isBusy: boolean;
  onChange: (patch: CategoryFormPatch) => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  sheetState: CategorySheetState | null;
};

type CategoryListItemProps = {
  category: AwardCategoryDto;
  onEdit: (category: AwardCategoryDto) => void;
  usage: CategoryUsage;
};

const CATEGORY_KIND_LABELS: Record<AwardCategoryDto["kind"], string> = {
  Sticker: "Sticker",
  UserVote: "Voto oficial",
};

const CATEGORY_ROW_CLASS =
  "w-full rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] px-4 py-3 text-left transition-colors hover:bg-[rgba(18,24,11,0.84)]";

const CATEGORY_ROW_ICON_CLASS =
  "mt-0.5 shrink-0 rounded-full border border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.94)] p-2 text-[rgba(245,237,224,0.72)]";

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

function CategoryListItem({
  category,
  onEdit,
  usage,
}: Readonly<CategoryListItemProps>) {
  return (
    <button
      type="button"
      onClick={() => onEdit(category)}
      className={CATEGORY_ROW_CLASS}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
              {category.name}
            </p>
            <Badge variant="secondary">{CATEGORY_KIND_LABELS[category.kind]}</Badge>
            <Badge variant={category.isActive ? "default" : "outline"}>
              {category.isActive ? "Ativa" : "Inativa"}
            </Badge>
          </div>

          {category.description ? (
            <p className="text-sm text-[rgba(245,237,224,0.74)]">{category.description}</p>
          ) : null}

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.08em] text-[rgba(245,237,224,0.56)]">
            <span>Ordem {category.sortOrder}</span>
            {usage.nomineeCount > 0 ? <span>{usage.nomineeCount} nomeações</span> : null}
            {usage.voteCount > 0 ? <span>{usage.voteCount} votos</span> : null}
            {category.kind === "UserVote" && category.voteQuestion ? (
              <span>{category.voteQuestion}</span>
            ) : null}
          </div>
        </div>

        <span className={CATEGORY_ROW_ICON_CLASS}>
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
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
}: Readonly<CategoryEditorSheetProps>) {
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
            <AdminDetailPanel className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {categoryUsage.nomineeCount} nomeaç{categoryUsage.nomineeCount === 1 ? "ão" : "ões"}
                </Badge>
                <Badge variant="secondary">
                  {categoryUsage.voteCount} voto{categoryUsage.voteCount === 1 ? "" : "s"}
                </Badge>
              </div>
              {categoryUsage.deleteReason ? (
                <p className="text-xs text-[rgba(245,237,224,0.68)]">
                  {categoryUsage.deleteReason}
                </p>
              ) : (
                <p className="text-xs text-[rgba(245,237,224,0.68)]">
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
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sticker">Sticker</SelectItem>
                  <SelectItem value="UserVote">Voto oficial</SelectItem>
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
            <AdminDetailPanel className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--bg-paper)]">Categoria ativa</p>
                <p className="text-xs text-[rgba(245,237,224,0.62)]">
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

          <div className="flex flex-col gap-2 border-t border-[rgba(212,184,150,0.14)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            {!isCreateMode && categoryUsage.canDelete ? (
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-[rgba(255,96,96,0.22)] text-[rgba(255,186,186,0.92)]"
                onClick={onDelete}
                disabled={isBusy}
              >
                <Trash2 className="h-4 w-4" />
                Apagar
              </Button>
            ) : (
              <div className="text-xs text-[rgba(245,237,224,0.56)]">
                {!isCreateMode ? "Apagamento indisponível nesta categoria." : null}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={onSave}
                disabled={isBusy || form.name.trim().length === 0}
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
    const nomineeCounts = adminNominees.reduce<Record<string, number>>((accumulator, nominee) => {
      if (!nominee.categoryId) return accumulator;
      accumulator[nominee.categoryId] = (accumulator[nominee.categoryId] ?? 0) + 1;
      return accumulator;
    }, {});

    const voteCounts = votes.reduce<Record<string, number>>((accumulator, vote) => {
      accumulator[vote.categoryId] = (accumulator[vote.categoryId] ?? 0) + 1;
      return accumulator;
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
      : {
          canDelete: false,
          deleteReason: null,
          nomineeCount: 0,
          voteCount: 0,
        };

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="editorial-kicker">Categorias</p>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Catalogo oficial
              </CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                Toca numa categoria para editar ou abre uma nova ficha para criar.
              </p>
            </div>

            <Button type="button" onClick={openCreateSheet} className="gap-2" disabled={isBusy}>
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

          {!loading ? (
            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <CategoryListItem
                  key={category.id}
                  category={category}
                  onEdit={openEditSheet}
                  usage={categoryUsageById[category.id]}
                />
              ))}
            </div>
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
