"use client";

import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { AdminSectionItem } from "../adminSections";

type AdminSectionNavProps = {
  items: ReadonlyArray<AdminSectionItem>;
};

export function AdminSectionNav({
  items,
}: Readonly<AdminSectionNavProps>) {
  return (
    <TabsList className="canhoes-admin-nav !grid h-auto w-full auto-cols-[minmax(7.5rem,1fr)] grid-flow-col gap-2 overflow-x-auto whitespace-normal p-2 scrollbar-none md:auto-cols-auto md:grid-cols-4 md:grid-flow-row">
      {items.map((item) => (
        <TabsTrigger
          key={item.id}
          value={item.id}
          className="canhoes-admin-tab min-h-[60px] w-full justify-between whitespace-normal rounded-[1.1rem] px-3 py-3 text-left text-[11px] leading-tight tracking-[0.1em]"
        >
          <span>{item.label}</span>
          {item.count > 0 ? (
            <Badge
              variant="secondary"
              className="min-w-5 justify-center rounded-full border-[rgba(107,76,42,0.14)] bg-[linear-gradient(180deg,var(--bg-paper-soft),var(--bg-paper-alt))] px-1.5 text-[10px] text-[var(--text-ink)] shadow-[var(--shadow-paper-soft)]"
            >
              {item.count}
            </Badge>
          ) : null}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
