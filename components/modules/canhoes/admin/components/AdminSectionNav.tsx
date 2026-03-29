"use client";

import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { AdminSectionId } from "./AdminControlStrip";

type AdminSectionNavProps = {
  items: ReadonlyArray<{
    count: number;
    label: string;
    value: AdminSectionId;
  }>;
};

export function AdminSectionNav({
  items,
}: Readonly<AdminSectionNavProps>) {
  return (
    <TabsList className="canhoes-admin-nav grid h-auto w-full grid-cols-4 gap-2 overflow-visible whitespace-normal p-2">
      {items.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className="canhoes-admin-tab min-h-[58px] w-full justify-between whitespace-normal px-3 py-3 text-left text-[11px] leading-tight tracking-[0.1em]"
        >
          <span>{item.label}</span>
          {item.count > 0 ? (
            <Badge
              variant="secondary"
              className="min-w-5 justify-center rounded-full border-[rgba(212,184,150,0.16)] bg-[rgba(245,237,224,0.12)] px-1.5 text-[10px] text-[var(--bg-paper)]"
            >
              {item.count}
            </Badge>
          ) : null}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
