"use client";

import { PillTabs, type PillTabItem } from "@/components/ui/pill-tabs";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";
import { getAdminSectionMeta } from "../adminSections";

type AdminRouteTabItem = Pick<AdminSectionItem, "count" | "icon" | "id" | "label">;

type AdminRouteTabsProps = {
  activeId: AdminSectionId;
  items?: ReadonlyArray<AdminRouteTabItem>;
  onSelect?: (id: AdminSectionId) => void;
};

export function AdminRouteTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminRouteTabsProps>) {
  const sections = items ?? getAdminSectionMeta().map((section) => ({ ...section, count: 0 }));

  const pillItems: PillTabItem[] = sections.map((section) => ({
    badge: section.count > 0 ? section.count : undefined,
    href: `/canhoes/admin/${section.id}`,
    icon: section.icon,
    id: section.id,
    label: section.label,
  }));

  return (
    <PillTabs
      items={pillItems}
      activeId={activeId}
      onSelect={onSelect as ((id: string) => void) | undefined}
      size="sm"
      className="canhoes-bits-panel canhoes-bits-panel--admin canhoes-admin-shell-panel"
    />
  );
}
