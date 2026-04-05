import { CompactSegmentTabs } from "@/components/modules/canhoes/CompactSegmentTabs";

type Category = { id: string; title: string };

type CategoryTabsProps<T extends Category> = {
  categories: T[];
  selectedId: string;
  onSelect: (id: string) => void;
  getBadge?: (category: T) => string | undefined;
};

/**
 * Wrapper around CompactSegmentTabs for category-based navigation.
 * Eliminates repetitive .map() patterns in voting modules.
 *
 * Usage:
 * ```tsx
 * <CategoryTabs
 *   categories={votingBoard.categories}
 *   selectedId={selectedCategoryId}
 *   onSelect={setSelectedCategoryId}
 *   getBadge={(cat) => cat.myOptionId ? "Votado" : undefined}
 * />
 * ```
 */
export function CategoryTabs<T extends Category>({
  categories,
  selectedId,
  onSelect,
  getBadge,
}: CategoryTabsProps<T>) {
  return (
    <CompactSegmentTabs
      activeId={selectedId}
      items={categories.map((cat) => ({
        id: cat.id,
        label: cat.title,
        badge: getBadge?.(cat),
      }))}
      onSelect={onSelect}
    />
  );
}
