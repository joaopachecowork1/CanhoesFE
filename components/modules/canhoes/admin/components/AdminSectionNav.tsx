"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";

type AdminSectionNavProps = {
  activeId: AdminSectionId;
  items: ReadonlyArray<AdminSectionItem>;
  onSelect: (id: AdminSectionId) => void;
};

type SectionButtonProps = {
  active: boolean;
  item: AdminSectionItem;
  onClick: () => void;
};

function SectionButton({
  active,
  item,
  onClick,
}: Readonly<SectionButtonProps>) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex min-h-[4.5rem] flex-col justify-between rounded-[var(--radius-md-token)] border px-3 py-3 text-left transition duration-200",
        active
          ? "border-[rgba(176,129,255,0.46)] bg-[linear-gradient(180deg,rgba(124,81,255,0.24),rgba(66,143,109,0.18))] text-[var(--bg-paper)] shadow-[0_14px_28px_rgba(8,10,7,0.38),0_0_24px_rgba(138,92,255,0.18)]"
          : "border-[rgba(125,145,102,0.2)] bg-[rgba(18,28,12,0.92)] text-[rgba(245,237,224,0.78)] shadow-[0_10px_18px_rgba(8,10,7,0.22)] hover:border-[rgba(176,129,255,0.26)] hover:bg-[rgba(26,37,18,0.96)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border transition duration-200",
            active
              ? "border-[rgba(196,173,255,0.36)] bg-[rgba(138,92,255,0.22)] text-[var(--accent-purple-soft)]"
              : "border-[rgba(125,145,102,0.18)] bg-[rgba(245,237,224,0.06)] text-[rgba(188,171,255,0.88)] group-hover:border-[rgba(176,129,255,0.24)] group-hover:bg-[rgba(138,92,255,0.12)]"
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>

        {item.count > 0 ? (
          <Badge className="rounded-full border-[rgba(176,129,255,0.38)] bg-[rgba(138,92,255,0.16)] px-2 text-[0.72rem] font-semibold text-[var(--accent-purple-soft)] shadow-[0_0_18px_rgba(138,92,255,0.14)]">
            {item.count}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-1">
        <p className="text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-[rgba(245,237,224,0.48)]">
          Modulo
        </p>
        <p className="text-sm font-semibold leading-tight">{item.label}</p>
      </div>
    </button>
  );
}

export function AdminSectionNav({
  activeId,
  items,
  onSelect,
}: Readonly<AdminSectionNavProps>) {
  const [showSecondary, setShowSecondary] = useState(false);

  const primaryItems = useMemo(
    () => items.filter((item) => item.group === "primary"),
    [items]
  );
  const secondaryItems = useMemo(
    () => items.filter((item) => item.group === "secondary"),
    [items]
  );
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  useEffect(() => {
    if (activeItem?.group === "secondary") {
      setShowSecondary(true);
    }
  }, [activeItem?.group]);

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
            Atalhos principais
          </p>
          <p className="text-[0.72rem] font-medium text-[rgba(245,237,224,0.42)]">
            Toca para mudar
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {primaryItems.map((item) => (
            <SectionButton
              key={item.id}
              active={item.id === activeId}
              item={item}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>

      {secondaryItems.length > 0 ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSecondary((currentValue) => !currentValue)}
            className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md-token)] border border-[rgba(176,129,255,0.22)] bg-[rgba(138,92,255,0.1)] px-3 py-3 text-left text-[var(--bg-paper)] transition duration-200 hover:bg-[rgba(138,92,255,0.14)]"
          >
            <span className="min-w-0">
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[var(--accent-purple-soft)]">
                Mais controlos
              </span>
              <span className="mt-1 block text-sm font-semibold">
                Abrir modulos secundarios
              </span>
            </span>

            {showSecondary ? (
              <ChevronUp className="h-4.5 w-4.5 text-[var(--accent-purple-soft)]" />
            ) : (
              <ChevronDown className="h-4.5 w-4.5 text-[var(--accent-purple-soft)]" />
            )}
          </button>

          {showSecondary ? (
            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => (
                <SectionButton
                  key={item.id}
                  active={item.id === activeId}
                  item={item}
                  onClick={() => onSelect(item.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
