"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { AdminSectionId, AdminSectionItem } from "../adminSections";
import { Button } from "@/components/ui/button";

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
  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg-token)] border border-[rgba(212,184,150,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(122,173,58,0.14),transparent_36%),linear-gradient(180deg,rgba(16,20,11,0.94),rgba(10,13,8,0.96))] px-3 py-3 shadow-[var(--shadow-panel)] backdrop-blur-sm">
      {/* Indicador de secção ativa */}
      {activeItem && (
        <div className="mb-2 flex items-center gap-2 border-b border-[rgba(122,173,58,0.2)] pb-2">
          <div className="flex h-8 w-1 items-stretch rounded-full bg-[var(--neon-green)] shadow-[var(--glow-green-sm)]" />
          <span className="font-[var(--font-mono)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--neon-green)]">
            {activeItem.label}
          </span>
          {activeItem.count > 0 && (
            <Badge className="border-[rgba(122,173,58,0.35)] bg-[rgba(45,68,24,0.92)] text-[var(--bg-paper)] shadow-none">
              {activeItem.count} pendente{activeItem.count > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      )}

      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none snap-x snap-mandatory">
        <div className="flex min-w-max gap-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeId;

            return (
              <Button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "canhoes-tap group relative inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200",
                  "snap-start",
                  isActive
                    ? "border-[rgba(122,173,58,0.5)] bg-[linear-gradient(180deg,rgba(36,49,23,0.98),rgba(18,24,11,0.98))] text-[var(--bg-paper)] shadow-[var(--glow-green-sm),0_4px_12px_rgba(122,173,58,0.2)]"
                    : "border-[rgba(212,184,150,0.14)] bg-[rgba(18,23,12,0.74)] text-[rgba(245,237,224,0.9)] hover:bg-[rgba(28,36,18,0.92)] hover:border-[rgba(212,184,150,0.24)] active:scale-95"
                )}
              >
                {/* Background animado para estado ativo */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-t from-[rgba(122,173,58,0.15)] to-transparent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                <Icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-[var(--neon-green)]" : "text-[rgba(245,237,224,0.8)] group-hover:text-[rgba(245,237,224,1)]"
                )} />
                <span className="font-[var(--font-mono)] text-[11px] uppercase tracking-[0.1em]">
                  {item.label}
                </span>
                {item.count > 0 && !isActive && (
                  <Badge
                    className="rounded-full px-1.5 text-[0.65rem] shadow-none border-[rgba(122,173,58,0.24)] bg-[rgba(122,173,58,0.18)] text-[var(--bg-paper)]"
                  >
                    {item.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
