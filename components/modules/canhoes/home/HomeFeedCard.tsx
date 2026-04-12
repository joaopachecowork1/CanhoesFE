"use client";

import { absMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";

const ITEM_CLASS =
  "rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)] bg-[linear-gradient(180deg,rgba(18,24,11,0.9),rgba(11,14,8,0.94))] px-3 py-3";

export function FeedPostCard({
  post,
}: Readonly<{
  post: CanhoesEventHomeViewModel["recentPosts"][number];
}>) {
  return (
    <div className={cn(ITEM_CLASS, "space-y-2")}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.8)]">
          {post.authorName}
        </p>
        <span className="text-xs text-[rgba(245,237,224,0.74)]">
          {new Date(post.createdAtUtc).toLocaleDateString("pt-PT")}
        </span>
      </div>
      <p className="text-sm leading-6 text-[var(--bg-paper)]">{post.text}</p>
      {post.mediaUrls?.[0] ? (
        <div className="overflow-hidden rounded-[var(--radius-md-token)] border border-[rgba(212,184,150,0.14)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absMediaUrl(post.mediaUrls[0])}
            alt={`Media do post de ${post.authorName}`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 400px"
            className="h-44 w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

export function SecretSantaStateCard({
  assignedUserName,
  assignedWishlistItemCount,
  hasAssignment,
  hasDraw,
}: Readonly<{
  assignedUserName?: string;
  assignedWishlistItemCount: number;
  hasAssignment: boolean;
  hasDraw: boolean;
}>) {
  return hasAssignment && assignedUserName ? (
    <div className={cn(ITEM_CLASS, "space-y-2")}>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
        Pessoa atribuida
      </p>
      <p className="text-base font-semibold text-[var(--bg-paper)]">{assignedUserName}</p>
      <p className="text-sm text-[rgba(245,237,224,0.84)]">
        {assignedWishlistItemCount} itens na wishlist.
      </p>
    </div>
  ) : (
    <div className={cn(ITEM_CLASS, "space-y-2")}>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[rgba(245,237,224,0.78)]">
        Estado
      </p>
      <p className="text-sm text-[var(--bg-paper)]">
        {hasDraw
          ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
          : "O sorteio desta edicao ainda nao foi gerado."}
      </p>
    </div>
  );
}
