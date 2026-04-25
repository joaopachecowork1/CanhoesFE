"use client";

import { useCallback } from "react";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";


import type { AwardCategoryDto } from "@/lib/api/types";
import { logFrontendError } from "@/lib/errors";
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

import { useCategoriesAdmin } from "../hooks/useCategoriesAdmin";
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
  onUpdate,
}: Readonly<CategoriesAdminProps>) {
  const {
    queries,
    mutations,
    state,
    actions,
  } = useCategoriesAdmin(eventId, onUpdate);

  const {
    sortedCategories,
    categoryUsageById,
    sheetState,
    deleteTarget,
    form,
    isLoading,
    isBusy,
    queryError,
  } = state;

  const {
    patchForm,
    openCreateSheet,
    openEditSheet,
    handleSheetOpenChange,
    handleSave,
    setDeleteTarget,
    handleDelete,
  } = actions;

  const activeCategoriesCount = sortedCategories.filter((category) => category.isActive).length;
  const inactiveCategoriesCount = sortedCategories.length - activeCategoriesCount;
  const userVoteCategoriesCount = sortedCategories.filter(
    (category) => category.kind === "UserVote"
  ).length;

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
              queries.categories.refetch(),
              queries.nominationsSummary.refetch(),
              queries.votes.refetch(),
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
            <AlertDialogCancel disabled={mutations.delete.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={mutations.delete.isPending} onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


