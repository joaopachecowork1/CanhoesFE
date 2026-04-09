"use client";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";

import { AdminRouteTabs } from "./AdminRouteTabs";

type AdminTabsProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
  onSelect: (id: AdminSectionId) => void;
};

export function AdminTabs({
  activeId,
  items,
  onSelect,
}: Readonly<AdminTabsProps>) {
  return <AdminRouteTabs activeId={activeId} items={items} onSelect={onSelect} />;
}
