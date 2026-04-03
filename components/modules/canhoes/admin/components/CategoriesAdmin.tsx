"use client";

import { useMemo, useState } from "react";
import { FolderTree, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { adminCopy } from "@/lib/canhoesCopy";
import { getErrorMessage, logFrontendError } from "@/lib/errors";
import type {
  AwardCategoryDto,
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
      logFrontendError("Admin.Categories.saveCategory", error, { categoryId, eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel guardar a categoria."));
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
      logFrontendError("Admin.Categories.createCategory", error, { eventId });
      toast.error(getErrorMessage(error, "Nao foi possivel criar a categoria."));
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (!eventId) return;
    if (!globalThis.confirm(`Eliminar a categoria "${categoryName}"?`)) return;

    try {
      await canhoesEventsRepo.adminDeleteCategory(eventId, categoryId);
      toast.success("Categoria removida");
      await onUpdate();
    } catch (error) {
      logFrontendError("Admin.Categories.deleteCategory", error, {
        categoryId,
        eventId,
      });
      toast.error(getErrorMessage(error, "Nao foi possivel eliminar a categoria."));
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
              className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-4 text-[var(--bg-paper)]"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px_220px_auto]">
                <div className="space-y-2">
                  <label htmlFor={`category-name-${row.id}`} className="editorial-kicker text-xs font-medium flex items-center gap-2">
                    <FolderTree className="h-3 w-3" />
                    Nome
                  </label>
                  <Input
                    id={`category-name-${row.id}`}
                    value={row.name}
                    onChange={(event) => setDraft(row.id, { name: event.target.value })}
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`category-order-${row.id}`} className="editorial-kicker text-xs font-medium">Ordem</label>
                  <Input
                    id={`category-order-${row.id}`}
                    value={row.sortOrder}
                    onChange={(event) => setDraft(row.id, { sortOrder: event.target.value })}
                    inputMode="numeric"
                    className="h-8"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor={`category-kind-${row.id}`} className="editorial-kicker text-xs font-medium">Tipo</label>
                  <Select
                    value={row.kind}
                    onValueChange={(value) => setDraft(row.id, { kind: value })}
                  >
                    <SelectTrigger id={`category-kind-${row.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sticker">Sticker</SelectItem>
                      <SelectItem value="UserVote">Votar num utilizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.16)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-2">
                    <span className="text-sm font-medium text-[var(--bg-paper)]">
                      Ativa
                    </span>
                    <Switch
                      checked={row.isActive}
                      onCheckedChange={(checked) => setDraft(row.id, { isActive: checked })}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(212,184,150,0.14)] pt-3">
                  <Badge variant="secondary" className="text-xs">
                    {row.kind === "Sticker" ? "Sticker" : "Votação"}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void saveCategory(row.id)}
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void deleteCategory(row.id, row.name)}
                      disabled={loading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </Button>
                  </div>
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
