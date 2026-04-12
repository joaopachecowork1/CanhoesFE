"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { cn } from "@/lib/utils";

type VirtualizedListProps<T> = {
  className?: string;
  estimateSize?: () => number;
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
 */
export function VirtualizedList<T>({
  className,
  estimateSize = () => 60,
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
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
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
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
