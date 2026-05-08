"use client";

import { cn } from "@/lib/utils";
import type { FeedSortOrder } from "@/components/modules/hub/hooks/useHubFeed";
import { HUB_FEED_SORT_OPTIONS } from "@/lib/postUtils";

type FeedSortBarProps = {
  allPostsCount: number;
  sort: FeedSortOrder;
  onSortChange: (sort: FeedSortOrder) => void;
};


export function FeedSortBar({
  allPostsCount,
  sort,
  onSortChange,
}: Readonly<FeedSortBarProps>) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-xl-token)] border border-[rgba(255,255,255,0.2)] bg-[rgba(18,24,12,0.94)] px-3 py-2 text-[var(--text-primary)] shadow-[var(--shadow-elevation-sm)]">
      <span className="text-xs font-medium text-[rgba(255,255,255,0.7)]">Ordenar:</span>
      {HUB_FEED_SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSortChange(option.value)}
          className={cn(
            "sort-pill rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
            sort === option.value ? "sort-pill-active" : ""
          )}
        >
          {option.label}
        </button>
      ))}
      {allPostsCount > 0 ? (
        <span className="ml-auto text-[10px] text-[rgba(255,255,255,0.7)]">
          {allPostsCount} post{allPostsCount !== 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}

