"use client";

import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";

type AdminSectionNavProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
};

export function AdminSectionNav({
  activeId,
  items,
}: Readonly<AdminSectionNavProps>) {
  const primaryItems = items.filter((item) => item.group === "primary");
  const secondaryItems = items.filter((item) => item.group === "secondary");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className="space-y-3 rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.1)] bg-[linear-gradient(180deg,rgba(11,14,8,0.94),rgba(9,12,7,0.98))] px-3 py-3 shadow-[var(--shadow-panel)] backdrop-blur-[16px]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="editorial-kicker text-[var(--accent-purple-soft)]">Secao ativa</p>
          <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
            {activeItem?.label}
          </p>
        </div>

        {activeItem?.count ? (
          <Badge className="rounded-full border-[var(--border-purple)] bg-[rgba(177,140,255,0.16)] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]">
            {activeItem.count}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="label text-[rgba(245,237,224,0.58)]">Atalhos principais</p>
        <TabsList className="canhoes-admin-nav !grid h-auto w-full grid-cols-2 gap-2 p-0 shadow-none">
          {primaryItems.map((item) => (
            <AdminSectionTrigger key={item.id} item={item} />
          ))}
        </TabsList>
      </div>

      {secondaryItems.length > 0 ? (
        <div className="space-y-2">
          <p className="label text-[rgba(245,237,224,0.58)]">Mais controlos</p>
          <TabsList className="canhoes-admin-subnav h-auto w-full gap-2 overflow-x-auto p-0 scrollbar-none">
            {secondaryItems.map((item) => (
              <AdminSectionTrigger key={item.id} item={item} compact />
            ))}
          </TabsList>
        </div>
      ) : null}
    </div>
  );
}

function AdminSectionTrigger({
  compact = false,
  item,
}: Readonly<{
  compact?: boolean;
  item: AdminSectionItem;
}>) {
  return (
    <TabsTrigger
      value={item.id}
      className={cn(
        "canhoes-admin-tab w-full justify-between whitespace-normal rounded-[1.1rem] text-left leading-tight tracking-[0.1em]",
        compact ? "min-h-[52px] min-w-[8.25rem] px-3 py-2.5" : "min-h-[72px] px-3 py-3"
      )}
    >
      <span className="pr-2">{item.label}</span>
      {item.count > 0 ? (
        <Badge className="min-w-6 justify-center rounded-full border-[var(--border-purple)] bg-[rgba(177,140,255,0.18)] px-1.5 text-[10px] text-[var(--accent-purple-soft)] shadow-[var(--glow-purple-sm)]">
          {item.count}
        </Badge>
      ) : null}
    </TabsTrigger>
  );
}
