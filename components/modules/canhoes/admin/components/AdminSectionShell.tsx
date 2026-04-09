"use client";

import type { ReactNode } from "react";

import type { AdminSectionId } from "../adminSections";

import { AdminRouteTabs } from "./AdminRouteTabs";

type AdminSectionShellProps = {
  activeId: AdminSectionId;
  children: ReactNode;
};

export function AdminSectionShell({
  activeId,
  children,
}: Readonly<AdminSectionShellProps>) {
  return (
    <div className="space-y-2">
      <AdminRouteTabs activeId={activeId} />
      <div>{children}</div>
    </div>
  );
}
