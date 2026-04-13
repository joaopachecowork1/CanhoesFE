"use client";

import type { AwardCategoryDto } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import { AdminDetailPanel, AdminDetailSheet } from "./adminContentUi";

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

type CategoryEditorSheetProps = {
  categoryUsage: { canDelete: boolean; deleteReason: string | null; nomineeCount: number; voteCount: number };
  form: CategoryFormState;
  isBusy: boolean;
  onChange: (patch: CategoryFormPatch) => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  sheetState: CategorySheetState | null;
};

export function CategoryEditorSheet({
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
                  className="w-full gap-2 border-[rgba(255,96,96,0.22)] text-[var(--danger)] sm:w-auto"
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
                className="w-full sm:w-auto"
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
