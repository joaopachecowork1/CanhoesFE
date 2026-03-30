"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";

type AdminSectionNavProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
  onSelect: (id: AdminSectionId) => void;
};

export function AdminSectionNav({
  activeId,
  items,
  onSelect,
}: Readonly<AdminSectionNavProps>) {
  const primaryItems = useMemo(
    () => items.filter((item) => item.group === "primary"),
    [items]
  );
  const secondaryItems = useMemo(
    () => items.filter((item) => item.group === "secondary"),
    [items]
  );
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className="space-y-3 rounded-[var(--radius-lg-token)] border border-[rgba(176,129,255,0.22)] bg-[linear-gradient(180deg,rgba(10,16,7,0.95),rgba(8,12,6,0.98))] px-3 py-3 shadow-[0_18px_30px_rgba(7,9,6,0.38),0_0_32px_rgba(138,92,255,0.12)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[rgba(176,129,255,0.18)] bg-[rgba(15,23,10,0.94)] px-3 py-3">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-purple-soft)]">
            Secao ativa
          </p>
          <p className="truncate text-sm font-semibold text-[var(--bg-paper)]">
            {activeItem?.label ?? "Painel"}
          </p>
          {activeItem?.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-[rgba(245,237,224,0.58)]">
              {activeItem.description}
            </p>
          ) : null}
        </div>

        {activeItem?.count ? (
          <Badge className="rounded-full border-[rgba(176,129,255,0.38)] bg-[rgba(138,92,255,0.16)] px-2 text-[0.72rem] font-semibold text-[var(--accent-purple-soft)] shadow-[0_0_18px_rgba(138,92,255,0.16)]">
            {activeItem.count}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[rgba(245,237,224,0.52)]">
            Modulos principais
          </p>
          <p className="text-[0.72rem] font-medium text-[rgba(245,237,224,0.42)]">
            Troca rapida
          </p>
        </div>

        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex min-w-max gap-2">
            {primaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-pressed={item.id === activeId}
                  className={cn(
                    "group inline-flex min-h-12 items-center gap-2 rounded-full border px-4 py-3 text-left transition duration-200",
                    item.id === activeId
                      ? "border-[rgba(176,129,255,0.46)] bg-[linear-gradient(180deg,rgba(124,81,255,0.24),rgba(66,143,109,0.18))] text-[var(--bg-paper)] shadow-[0_10px_24px_rgba(8,10,7,0.34),0_0_20px_rgba(138,92,255,0.18)]"
                      : "border-[rgba(125,145,102,0.2)] bg-[rgba(18,28,12,0.9)] text-[rgba(245,237,224,0.82)] hover:border-[rgba(176,129,255,0.26)] hover:bg-[rgba(26,37,18,0.94)]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border",
                      item.id === activeId
                        ? "border-[rgba(196,173,255,0.36)] bg-[rgba(138,92,255,0.22)] text-[var(--accent-purple-soft)]"
                        : "border-[rgba(125,145,102,0.18)] bg-[rgba(245,237,224,0.06)] text-[rgba(188,171,255,0.88)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                <span className="space-y-0.5">
                  <span className="block text-sm font-semibold leading-none">
                    {item.label}
                  </span>
                  <span className="block max-w-[13rem] line-clamp-2 text-[0.68rem] leading-4 text-[rgba(245,237,224,0.48)]">
                    {item.description}
                  </span>
                </span>

                  {item.count > 0 ? (
                    <Badge className="rounded-full border-[rgba(176,129,255,0.38)] bg-[rgba(138,92,255,0.16)] px-2 text-[0.72rem] font-semibold text-[var(--accent-purple-soft)] shadow-[0_0_18px_rgba(138,92,255,0.14)]">
                      {item.count}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {secondaryItems.length > 0 ? (
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
          <div className="rounded-[var(--radius-md-token)] border border-[rgba(176,129,255,0.16)] bg-[rgba(15,23,10,0.82)] px-3 py-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-purple-soft)]">
              Secoes secundarias
            </p>
            <p className="mt-1 text-sm text-[rgba(245,237,224,0.72)]">
              Membros, votos, sorteio e resumo ficam separados para manter a mesa principal limpa.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[rgba(245,237,224,0.52)]">
              Mais controlos
            </p>
            <Select
              value={activeItem?.group === "secondary" ? activeId : undefined}
              onValueChange={(value) => onSelect(value as AdminSectionId)}
            >
              <SelectTrigger className="w-full border-[rgba(176,129,255,0.22)] bg-[linear-gradient(180deg,rgba(31,22,44,0.94),rgba(20,15,31,0.96))] text-[var(--bg-paper)]">
                <SelectValue placeholder="Escolher secao secundaria" />
              </SelectTrigger>
              <SelectContent>
                {secondaryItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                    {item.count > 0 ? ` (${item.count})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
