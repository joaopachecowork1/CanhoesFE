import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AwardCategoryDto } from "@/lib/api/types";
import { Pencil } from "lucide-react";

export const CATEGORY_KIND_LABELS: Record<AwardCategoryDto["kind"], string> = {
  Sticker: "Sticker",
  UserVote: "Voto oficial",
};

type CategoryListItemProps = {
  category: AwardCategoryDto;
  onEdit: (category: AwardCategoryDto) => void;
  usage: { nomineeCount: number; voteCount: number };
};

export function CategoryListItem({
  category,
  onEdit,
  usage,
}: Readonly<CategoryListItemProps>) {
  return (
    <button
      type="button"
      onClick={() => onEdit(category)}
      className={cn(
        "w-full rounded-[var(--radius-md-token)] border border-[var(--border-subtle)] bg-[var(--bg-paper)] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-paper-soft)]",
        "min-h-11"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--ink-primary)]">
              {category.name}
            </p>
            <Badge variant="secondary">{CATEGORY_KIND_LABELS[category.kind]}</Badge>
            <Badge variant={category.isActive ? "default" : "outline"}>
              {category.isActive ? "Ativa" : "Inativa"}
            </Badge>
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
            {category.kind === "UserVote" && category.voteQuestion ? (
              <span className="normal-case tracking-normal">{category.voteQuestion}</span>
            ) : null}
          </div>
        </div>

        <span className="mt-0.5 shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-paper-soft)] p-2 text-[var(--ink-muted)]">
          <Pencil className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}
