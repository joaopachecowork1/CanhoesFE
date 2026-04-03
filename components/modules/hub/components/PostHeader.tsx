"use client";

import { Pin, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, initials } from "./hubUtils";

const AVATAR_ACCENTS = [
  "var(--color-moss)",
  "var(--color-brown)",
  "var(--color-beige-dark)",
  "var(--color-title-light)",
];

function accentForName(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index++) {
    hash = (hash * 31 + name.charCodeAt(index)) & 0xffff;
  }

  return AVATAR_ACCENTS[Math.abs(hash) % AVATAR_ACCENTS.length];
}

export function PostHeader({
  authorName,
  createdAtUtc,
  isPinned,
  isAdmin,
  onAdminPin,
  onAdminDelete,
}: Readonly<{
  authorName: string;
  createdAtUtc: string;
  isPinned?: boolean;
  isAdmin?: boolean;
  onAdminPin?: () => void;
  onAdminDelete?: () => void;
}>) {
  const accent = accentForName(authorName);

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold"
          style={{
            background: `linear-gradient(180deg, ${accent}28, rgba(255,255,255,0.08))`,
            borderColor: `${accent}44`,
            color: accent,
          }}
        >
          {initials(authorName)}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {authorName}
            </p>
            {isPinned ? <Badge variant="secondary">Fixado</Badge> : null}
          </div>
          <p className="text-xs text-[rgba(242,234,216,0.74)]">
            {formatDateTime(createdAtUtc)}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-[rgba(242,234,216,0.72)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--text-primary)]"
            onClick={onAdminPin}
            title="Fixar ou desafixar"
          >
            <Pin className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-[rgba(242,234,216,0.72)] hover:bg-[rgba(255,255,255,0.08)] hover:text-[var(--color-danger)]"
            onClick={onAdminDelete}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
