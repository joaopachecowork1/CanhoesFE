"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { FeedSortOrder } from "@/hooks/useHubFeed";
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
    <div className="surface-panel flex items-center gap-2 px-3 py-2">
      <span className="text-xs font-medium text-[var(--text-muted)]">Ordenar:</span>
      {HUB_FEED_SORT_OPTIONS.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onSortChange(option.value)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "sort-pill rounded-full px-3 py-1 text-xs font-medium",
            sort === option.value ? "sort-pill-active" : ""
          )}
        >
          {option.label}
        </motion.button>
      ))}
      {allPostsCount > 0 ? (
        <span className="ml-auto text-[10px] text-[var(--text-muted)]">
          {allPostsCount} post{allPostsCount !== 1 ? "s" : ""}
        </span>
      ) : null}
    </div>
  );
}
