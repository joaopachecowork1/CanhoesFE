"use client";

import { useEffect, useState } from "react";

/**
 * Manages category selection state for voting, results, and nomination views.
 * Auto-selects the first category when the list loads or changes.
 * Preserves the current selection if it still exists in the new list.
 *
 * Usage:
 * ```ts
 * // Items with `id` property:
 * const { selectedId, setSelectedId, selectedItem } = useCategorySelection(categories);
 *
 * // Items with a different id property:
 * const { selectedId, setSelectedId, selectedItem } = useCategorySelection(categories, (c) => c.categoryId);
 * ```
 */
export function useCategorySelection<T>(
  items: T[],
  getId: (item: T) => string
) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((current) => {
      if (current && items.some((item) => getId(item) === current)) return current;
      return getId(items[0]);
    });
  }, [items, getId]);

  const selectedItem = items.find((item) => getId(item) === selectedId) ?? null;

  return {
    selectedId,
    setSelectedId,
    selectedItem,
    items,
  };
}
