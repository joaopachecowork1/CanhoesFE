"use client";

import { absMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

import type { CanhoesEventHomeViewModel } from "./useCanhoesEventHome";

const ITEM_CLASS =
  "group relative overflow-hidden rounded-[var(--radius-md-token)] border border-[var(--border-paper)] bg-[var(--bg-paper)] px-4 py-4 shadow-[var(--shadow-paper)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-paper-soft)] hover:border-[var(--border-moss)]";

export function FeedPostCard({
  post,
}: Readonly<{
  post: CanhoesEventHomeViewModel["recentPosts"][number];
}>) {
  return (
    <div className={cn(ITEM_CLASS, "space-y-3")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--moss)] opacity-60 group-hover:scale-125 group-hover:opacity-100 transition-all duration-300" />
          <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            {post.authorName}
          </p>
        </div>
        <span className="text-[10px] font-medium tracking-wide text-[var(--ink-muted)] opacity-80">
          {new Date(post.createdAtUtc).toLocaleDateString("pt-PT", { day: '2-digit', month: 'short' })}
        </span>
      </div>
      <p className="body-small leading-relaxed text-[var(--ink-primary)] selection:bg-[var(--moss-subtle)]">
        {post.text}
      </p>
      {post.mediaUrls?.[0] ? (
        <div className="relative mt-2 overflow-hidden rounded-[var(--radius-sm-token)] border border-[var(--border-paper-soft)] bg-[var(--bg-paper-soft)] min-h-[12rem]">
          {/* Skeleton background while loading */}
          <div className="absolute inset-0 animate-pulse bg-[rgba(212,184,150,0.08)]" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={absMediaUrl(post.mediaUrls[0])}
            alt={`Media do post de ${post.authorName}`}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, 400px"
            className="relative z-10 h-48 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onLoad={(e) => {
              (e.currentTarget.previousElementSibling as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 z-20 ring-1 ring-inset ring-black/5 pointer-events-none" />
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
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        Pessoa atribuida
      </p>
      <p className="text-base font-semibold text-[var(--ink-primary)]">{assignedUserName}</p>
      <p className="text-sm text-[var(--ink-secondary)]">
        {assignedWishlistItemCount} itens na wishlist.
      </p>
    </div>
  ) : (
    <div className={cn(ITEM_CLASS, "space-y-2")}>
      <p className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        Estado
      </p>
      <p className="text-sm text-[var(--ink-primary)]">
        {hasDraw
          ? "O sorteio ja existe, mas a tua atribuicao ainda nao ficou disponivel."
          : "O sorteio desta edicao ainda nao foi gerado."}
      </p>
    </div>
  );
}
