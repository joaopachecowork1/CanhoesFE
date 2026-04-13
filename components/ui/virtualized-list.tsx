"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";

type VirtualizedListProps<T> = {
  className?: string;
  estimateSize?: () => number;
  getKey?: (item: T, index: number) => string | number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  items: T[];
};

/**
 * Virtualized list using @tanstack/react-virtual.
 * Renders only visible items in the viewport (~10-15 DOM nodes)
 * regardless of total item count.
 *
 * Default estimateSize is 60px — tune per use case.
 * 
 * Use `getKey` to provide stable keys when items can be reordered
 * or removed. Falls back to index if not provided.
 */
export function VirtualizedList<T>({
  className,
  estimateSize = () => 60,
  getKey,
  items,
  overscan = 5,
  renderItem,
}: Readonly<VirtualizedListProps<T>>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      className={cn("overflow-y-auto", className)}
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          const key = getKey ? getKey(item, virtualRow.index) : virtualRow.index;

          return (
            <div
              key={key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
