"use client";

import { useMemo, useState } from "react";
import { FolderTree, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { summarizeModerationStatuses } from "@/components/modules/canhoes/admin/moderationUtils";
import { adminCopy } from "@/lib/canhoesCopy";
import type {
  AwardCategoryDto,
  CategoryProposalDto,
  MeasureProposalDto,
} from "@/lib/api/types";
import { canhoesEventsRepo } from "@/lib/repositories/canhoesEventsRepo";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Props = {
  eventId: string | null;
  categories: AwardCategoryDto[];
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
  loading: boolean;
  onUpdate: () => Promise<void>;
};

type Draft = {
  id: string;
  isActive: boolean;
  kind: string;
  name: string;
  sortOrder: string;
};

export function CategoriesAdmin({
  eventId,
  categories,
  categoryProposals: _categoryProposals,
  measureProposals: _measureProposals,
  loading,
  onUpdate,
}: Readonly<Props>) {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryKind, setNewCategoryKind] = useState<"Sticker" | "UserVote">(
    "Sticker"
  );
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category] as const)),
    [categories]
  );

  const rows = useMemo(
    () =>
      categories
        .slice()
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((category) => {
          const draft = drafts[category.id];
          return (
            draft ?? {
              id: category.id,
              isActive: category.isActive,
              kind: category.kind,
              name: category.name,
              sortOrder: String(category.sortOrder),
            }
          );
        }),
    [categories, drafts]
  );

  const setDraft = (categoryId: string, patch: Partial<Draft>) => {
    setDrafts((currentDrafts) => {
      const sourceCategory = categoriesById.get(categoryId);
      const baseDraft = currentDrafts[categoryId] ?? {
        id: categoryId,
        isActive: sourceCategory?.isActive ?? true,
        kind: sourceCategory?.kind ?? "Sticker",
        name: sourceCategory?.name ?? "",
        sortOrder: String(sourceCategory?.sortOrder ?? 0),
      };

      return {
        ...currentDrafts,
        [categoryId]: { ...baseDraft, ...patch },
      };
    });
  };

  const saveCategory = async (categoryId: string) => {
    if (!eventId) return;

    const draft = drafts[categoryId];
    if (!draft) return;

    const parsedSortOrder = Number(draft.sortOrder);
    if (!Number.isFinite(parsedSortOrder)) {
      toast.error("Ordem invalida");
      return;
    }

    try {
      await canhoesEventsRepo.adminUpdateCategory(eventId, categoryId, {
        name: draft.name.trim(),
        sortOrder: parsedSortOrder,
        isActive: draft.isActive,
        kind: draft.kind,
      });

      setDrafts((currentDrafts) => {
        const remainingDrafts = { ...currentDrafts };
        delete remainingDrafts[categoryId];
        return remainingDrafts;
      });

      toast.success("Categoria atualizada");
      await onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao guardar categoria");
    }
  };

  const createCategory = async () => {
    if (!eventId) return;

    const normalizedName = newCategoryName.trim();
    if (!normalizedName) return;

    setIsCreating(true);
    try {
      await canhoesEventsRepo.adminCreateCategory(eventId, {
        name: normalizedName,
        sortOrder: null,
        kind: newCategoryKind,
        description: null,
        voteQuestion: null,
        voteRules: null,
      });
      setNewCategoryName("");
      toast.success("Categoria criada");
      await onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar categoria");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!eventId) return;
    if (!window.confirm(`Eliminar a categoria "${categoryName}"?`)) return;

    try {
      await canhoesEventsRepo.adminDeleteCategory(eventId, categoryId);
      toast.success("Categoria removida");
      await onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel eliminar a categoria");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-[var(--color-moss)]/20">
        <CardHeader className="space-y-1">
          <p className="editorial-kicker">{adminCopy.categories.createKicker}</p>
          <CardTitle>{adminCopy.categories.createTitle}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="body-small text-[var(--color-text-muted)]">
            {adminCopy.categories.createDescription}
          </p>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <Input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="Ex: Melhor frase de grupo"
            />

            <Select
              value={newCategoryKind}
              onValueChange={(value) =>
                setNewCategoryKind(value as "Sticker" | "UserVote")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sticker">Sticker</SelectItem>
                <SelectItem value="UserVote">Votar num utilizador</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              className="w-full lg:w-auto"
              onClick={() => void createCategory()}
              disabled={isCreating || !newCategoryName.trim()}
            >
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[var(--color-moss)]/20">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="editorial-kicker">{adminCopy.categories.manageKicker}</p>
              <CardTitle>{adminCopy.categories.manageTitle}</CardTitle>
            </div>
            <Badge variant="outline">{categories.length}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!loading && rows.length === 0 ? (
            <AdminStateMessage variant="panel">
              {adminCopy.categories.empty}
            </AdminStateMessage>
          ) : null}

          {rows.map((row) => (
            <article
              key={row.id}
              className="canhoes-paper-card rounded-[var(--radius-md-token)] px-4 py-4"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_110px_220px_auto]">
                <div className="space-y-2">
                  <label className="editorial-kicker flex items-center gap-2">
                    <FolderTree className="h-3.5 w-3.5" />
                    Nome
                  </label>
                  <Input
                    value={row.name}
                    onChange={(event) => setDraft(row.id, { name: event.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="editorial-kicker">Ordem</label>
                  <Input
                    value={row.sortOrder}
                    onChange={(event) => setDraft(row.id, { sortOrder: event.target.value })}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <label className="editorial-kicker">Tipo</label>
                  <Select
                    value={row.kind}
                    onValueChange={(value) => setDraft(row.id, { kind: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sticker">Sticker</SelectItem>
                      <SelectItem value="UserVote">Votar num utilizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3 lg:justify-end">
                  <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[var(--color-beige-dark)]/20 bg-[var(--bg-paper-olive)] px-3 py-2">
                    <span className="text-sm font-medium text-[var(--text-ink)]">
                      Ativa
                    </span>
                    <Switch
                      checked={row.isActive}
                      onCheckedChange={(checked) => setDraft(row.id, { isActive: checked })}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => void saveCategory(row.id)}
                    disabled={loading}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => void deleteCategory(row.id, row.name)}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </CardContent>
      </Card>

      {/* Historico completo de propostas e medidas vive agora na area de Moderation para evitar duplicacao com PendingProposals */}
    </div>
  );
}
