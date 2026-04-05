"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Pencil } from "lucide-react";

import { AdminStateMessage } from "@/components/modules/canhoes/admin/components/AdminStateMessage";
import { adminCopy } from "@/lib/canhoesCopy";
import type { AwardCategoryDto } from "@/lib/api/types";

type Props = {
  categories: AwardCategoryDto[];
  eventId: string | null;
  loading: boolean;
  onUpdate: () => Promise<void>;
};

export function CategoriesAdmin({ categories, eventId, loading, onUpdate }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const editingInputName = useRef<HTMLInputElement>(null);
  const editingInputDescription = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingId) {
      const category = categories.find((c) => c.id === editingId);
      if (category) {
        setEditingName(category.name);
        setEditingDescription(category.description ?? "");
      }
    }
  }, [editingId, categories]);

  useEffect(() => {
    if (editingInputName.current && editingId) {
      editingInputName.current.focus();
    }
  }, [editingId]);

  const handleToggleExpand = () => setExpanded((prev) => !prev);

  const handleEdit = (category: AwardCategoryDto) => {
    setEditingId(category.id);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingName.trim()) {
      setError(adminCopy.categories.error.emptyName);
      return;
    }
    if (!editingDescription.trim()) {
      setError(adminCopy.categories.error.emptyDescription);
      return;
    }
    if (editingName.trim().length > adminCopy.categories.maxNameLength) {
      setError(adminCopy.categories.error.tooLong);
      return;
    }
    if (editingDescription.trim().length > adminCopy.categories.maxDescriptionLength) {
      setError(adminCopy.categories.error.tooLongDescription);
      return;
    }

    await onUpdate();
    setEditingId(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !error) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] px-4 py-3">
        <div className="space-y-0.5">
          <div className="body-large font-medium text-[var(--bg-paper)]">{adminCopy.categories.title}</div>
          <div className="body-small text-[rgba(245,237,224,0.72)]">
            {adminCopy.categories.description}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleExpand}
          className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.94)] text-[rgba(245,237,224,0.64)] transition-all hover:border-[rgba(177,140,255,0.32)] hover:bg-[rgba(46,155,240,0.16)] hover:text-[var(--bg-paper)]"
          title={expanded ? adminCopy.categories.collapse : adminCopy.categories.expand}
        >
          <ArrowUpDown className="h-4 w-4 transition-transform" />
          <span className="sr-only">{expanded ? adminCopy.categories.collapse : adminCopy.categories.expand}</span>
        </button>
      </div>

      <AdminStateMessage>
        {loading ? adminCopy.categories.loading : adminCopy.categories.success}
      </AdminStateMessage>

      {error && (
        <AdminStateMessage tone="error">
          <div className="flex items-center gap-2">
            <span className="editorial-kicker">{error}</span>
          </div>
        </AdminStateMessage>
      )}

      {!expanded && categories.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-1">
          {categories.slice(0, 5).map((category) => (
            <MiniCategoryRow
              key={category.id}
              category={category}
              loading={loading}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {(expanded || categories.length === 0) && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              loading={loading}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {categories.length === 0 && !expanded && (
        <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] p-4">
          <div className="body-small text-[rgba(245,237,224,0.56)] text-center">
            {adminCopy.categories.empty}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniCategoryRow({
  category,
  loading,
  onEdit,
}: {
  category: AwardCategoryDto;
  loading: boolean;
  onEdit: (c: AwardCategoryDto) => void;
}) {
  const handleClick = () => {
    onEdit(category);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex-1 rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] p-3.5 text-left transition-colors hover:border-[rgba(177,140,255,0.28)] hover:bg-[rgba(18,23,12,0.86)] active:border-[rgba(177,140,255,0.32)] active:bg-[rgba(11,14,8,0.86)] disabled:pointer-events-none disabled:opacity-50 disabled:active:border-[rgba(212,184,150,0.14)] disabled:active:bg-[rgba(11,14,8,0.76)]"
    >
      <div className="body-medium font-medium text-[rgba(245,237,224,0.88)] leading-tight">
        {category.name}
      </div>
      <div className="body-small mt-1 text-[rgba(245,237,224,0.56)] leading-tight">
        {category.description}
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.94)] px-2.5 py-0.5 text-[10px] font-medium text-[rgba(245,237,224,0.64)]">
        <Pencil className="h-3 w-3" />
        {adminCopy.categories.edit}
      </div>
    </button>
  );
}

function CategoryRow({
  category,
  loading,
  onEdit,
}: {
  category: AwardCategoryDto;
  loading: boolean;
  onEdit: (c: AwardCategoryDto) => void;
}) {
  return (
    <div className="rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[rgba(11,14,8,0.76)] p-3.5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="body-medium font-medium text-[rgba(245,237,224,0.88)]">
            {category.name}
          </div>
          <div className="body-small mt-1 text-[rgba(245,237,224,0.56)]">
            {category.description}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(category)}
            disabled={loading}
            className="rounded-full border border-[rgba(212,184,150,0.18)] bg-[rgba(18,23,12,0.94)] p-1.5 text-[rgba(245,237,224,0.64)] transition-colors hover:border-[rgba(177,140,255,0.32)] hover:bg-[rgba(46,155,240,0.16)] hover:text-[var(--bg-paper)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[rgba(212,184,150,0.18)] disabled:hover:bg-[rgba(18,23,12,0.94)] disabled:hover:text-[rgba(245,237,224,0.64)]"
            title={adminCopy.categories.edit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
