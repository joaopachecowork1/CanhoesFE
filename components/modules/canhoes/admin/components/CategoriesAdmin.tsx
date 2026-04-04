"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedCategoryId(null);
      return;
    }

    setSelectedCategoryId((current) => {
      if (current && rows.some((row) => row.id === current)) return current;
      return rows[0].id;
    });
  }, [rows]);

  const selectedCategory = useMemo(
    () => rows.find((row) => row.id === selectedCategoryId) ?? null,
    [rows, selectedCategoryId]
  );

  const dirtyCount = Object.keys(drafts).length;

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

  const saveAllDrafts = async () => {
    if (!eventId) return;

    const draftIds = Object.keys(drafts);
    if (draftIds.length === 0) return;

    for (const categoryId of draftIds) {
      const draft = drafts[categoryId];
      if (!draft) continue;

      const parsedSortOrder = Number(draft.sortOrder);
      if (!Number.isFinite(parsedSortOrder)) {
        toast.error("Ordem invalida em uma ou mais categorias");
        return;
      }
    }

    try {
      await Promise.all(
        draftIds.map((categoryId) => {
          const draft = drafts[categoryId];
          if (!draft) return Promise.resolve();

          return canhoesEventsRepo.adminUpdateCategory(eventId, categoryId, {
            name: draft.name.trim(),
            sortOrder: Number(draft.sortOrder),
            isActive: draft.isActive,
            kind: draft.kind,
          });
        })
      );

      setDrafts({});
      toast.success("Categorias guardadas");
      await onUpdate();
    } catch (error) {
      logFrontendError("Admin.Categories.saveAllDrafts", error, { eventId, draftIds });
      toast.error(getErrorMessage(error, "Nao foi possivel guardar as categorias."));
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
            <div className="flex items-center gap-2">
              {dirtyCount > 0 ? (
                <Badge className="border-[rgba(122,173,58,0.34)] bg-[rgba(122,173,58,0.2)] text-[var(--bg-paper)]">
                  {dirtyCount} por guardar
                </Badge>
              ) : null}
              <Badge variant="outline">{categories.length}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!loading && rows.length === 0 ? (
            <AdminStateMessage variant="panel">
              {adminCopy.categories.empty}
            </AdminStateMessage>
          ) : null}

          {rows.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
              <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.72)] p-2">
                <div className="max-h-[58svh] space-y-1 overflow-y-auto pr-1">
                  {rows.map((row) => {
                    const isSelected = row.id === selectedCategoryId;
                    const isDirty = Boolean(drafts[row.id]);

                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(row.id)}
                        className={
                          isSelected
                            ? "w-full rounded-[var(--radius-md-token)] border border-[rgba(122,173,58,0.36)] bg-[rgba(36,49,23,0.9)] px-3 py-2.5 text-left"
                            : "w-full rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.12)] bg-[rgba(18,24,11,0.62)] px-3 py-2.5 text-left hover:bg-[rgba(24,31,16,0.82)]"
                        }
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
                              {row.name || "Sem nome"}
                            </p>
                            <p className="mt-1 text-xs text-[rgba(245,237,224,0.72)]">
                              Ordem {row.sortOrder} · {row.kind === "Sticker" ? "Sticker" : "Votação"}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {row.isActive ? null : (
                              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                                Off
                              </Badge>
                            )}
                            {isDirty ? (
                              <Badge className="h-5 border-[rgba(122,173,58,0.34)] bg-[rgba(122,173,58,0.2)] px-1.5 text-[10px] text-[var(--bg-paper)]">
                                Editada
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedCategory ? (
                <article className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-4 py-4 text-[var(--bg-paper)]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor={`category-name-${selectedCategory.id}`} className="editorial-kicker text-xs font-medium flex items-center gap-2">
                        <FolderTree className="h-3 w-3" />
                        Editor da categoria
                      </label>
                      <Badge variant="outline" className="h-6 text-xs">
                        {selectedCategory.kind === "Sticker" ? "Sticker" : "Votação"}
                      </Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_110px]">
                      <div className="space-y-2">
                        <label htmlFor={`category-name-${selectedCategory.id}`} className="editorial-kicker text-xs font-medium">Nome</label>
                        <Input
                          id={`category-name-${selectedCategory.id}`}
                          value={selectedCategory.name}
                          onChange={(event) =>
                            setDraft(selectedCategory.id, { name: event.target.value })
                          }
                          className="h-8"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor={`category-order-${selectedCategory.id}`} className="editorial-kicker text-xs font-medium">Ordem</label>
                        <Input
                          id={`category-order-${selectedCategory.id}`}
                          value={selectedCategory.sortOrder}
                          onChange={(event) =>
                            setDraft(selectedCategory.id, { sortOrder: event.target.value })
                          }
                          inputMode="numeric"
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="space-y-2">
                        <label htmlFor={`category-kind-${selectedCategory.id}`} className="editorial-kicker text-xs font-medium">Tipo</label>
                        <Select
                          value={selectedCategory.kind}
                          onValueChange={(value) => setDraft(selectedCategory.id, { kind: value })}
                        >
                          <SelectTrigger id={`category-kind-${selectedCategory.id}`} className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sticker">Sticker</SelectItem>
                            <SelectItem value="UserVote">Votar num utilizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="editorial-kicker text-xs font-medium">Estado</p>
                        <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.16)] bg-[rgba(0,0,0,0.3)] px-2.5 py-1.5">
                          <span className="text-xs font-medium">Ativa</span>
                          <Switch
                            checked={selectedCategory.isActive}
                            onCheckedChange={(checked) =>
                              setDraft(selectedCategory.id, { isActive: checked })
                            }
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="sticky bottom-0 -mx-1 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(12,16,9,0.92)] px-3 py-2 backdrop-blur-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-[rgba(245,237,224,0.72)]">
                          {drafts[selectedCategory.id]
                            ? "Alteracoes por guardar nesta categoria"
                            : "Sem alteracoes locais"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => void saveCategory(selectedCategory.id)}
                            disabled={loading || !drafts[selectedCategory.id]}
                            className="h-8 text-xs"
                          >
                            Guardar atual
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => void saveAllDrafts()}
                            disabled={loading || dirtyCount === 0}
                            className="h-8 text-xs"
                          >
                            Guardar todas
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              void deleteCategory(selectedCategory.id, selectedCategory.name)
                            }
                            disabled={loading}
                            className="h-8 gap-1.5 text-xs"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Historico completo de propostas e medidas vive agora na area de Moderation para evitar duplicacao com PendingProposals */}
    </div>
  );
}
