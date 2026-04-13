"use client";

import { motion } from "framer-motion";

type FeedLoadMoreProps = {
  hasMore: boolean;
  isFetchingNextPage: boolean;
  remainingCount: number;
  onLoadMore: () => void;
  sentinelRef: React.MutableRefObject<HTMLDivElement | null>;
};

export function FeedLoadMore({
  hasMore,
  isFetchingNextPage,
  remainingCount,
  onLoadMore,
  sentinelRef,
}: Readonly<FeedLoadMoreProps>) {
  if (!hasMore) return null;

  return (
    <>
      <div ref={sentinelRef} className="flex justify-center py-6">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-3">
            <div className="skeleton-shimmer h-6 w-6 rounded-full" />
            <span className="text-xs text-[var(--text-muted)]">A carregar mais posts...</span>
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full border-2 border-dashed border-[var(--border-subtle)] animate-pulse" />
        )}
      </div>

      {!isFetchingNextPage ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center py-2"
        >
          <motion.button
            type="button"
            onClick={onLoadMore}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-deep)] px-6 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--border-moss)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            aria-label="Carregar mais posts manualmente"
          >
            Carregar mais ({Math.max(remainingCount, 0)} restantes)
          </motion.button>
        </motion.div>
      ) : null}
    </>
  );
}
