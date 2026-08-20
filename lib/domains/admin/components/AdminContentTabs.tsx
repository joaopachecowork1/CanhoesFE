"use client";

import { PillTabs, type PillTabItem } from "@/components/ui/pill-tabs";

import type {
  AdminContentSectionId,
  AdminContentSectionItem,
} from "./adminContentSections";

type AdminContentTabsProps = {
  activeId: AdminContentSectionId;
  items: ReadonlyArray<AdminContentSectionItem>;
  onSelect: (id: AdminContentSectionId) => void;
};

export function AdminContentTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminContentTabsProps>) {
  const pillItems: PillTabItem[] = items.map((item) => ({
    badge: item.count > 0 ? item.count : undefined,
    icon: item.icon,
    id: item.id,
    label: item.label,
  }));

  return (
    <PillTabs
      items={pillItems}
      activeId={activeId}
      onSelect={onSelect as (id: string) => void}
      size="sm"
      className="text-[var(--color-text-primary)]"
    />
  );
}
