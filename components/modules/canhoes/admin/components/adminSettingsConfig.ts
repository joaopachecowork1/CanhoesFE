"use client";

import type { AdminModuleKey, EventPhaseDto } from "@/lib/api/types";
import type { ModuleVisibilityItem } from "@/hooks/useModuleVisibility";

export const PHASE_LABELS: Record<EventPhaseDto["type"], string> = {
  PROPOSALS: "Nomeações",
  VOTING: "Votação",
  RESULTS: "Resultados",
  DRAW: "Sorteio",
};

export const PHASE_OPTIONS = Object.keys(PHASE_LABELS) as EventPhaseDto["type"][];

export const QUICK_MODULE_ORDER: readonly AdminModuleKey[] = [
  "feed",
  "nominees",
  "categories",
  "secretSanta",
] as const;

export const ADVANCED_MODULE_ORDER: readonly AdminModuleKey[] = [
  "wishlist",
  "voting",
  "stickers",
  "measures",
  "gala",
] as const;

export function formatPhaseLabel(phaseType: EventPhaseDto["type"] | null | undefined) {
  if (!phaseType) return "Sem fase";
  return PHASE_LABELS[phaseType];
}

export function selectModuleItems(
  order: readonly AdminModuleKey[],
  itemsByKey: Partial<Record<AdminModuleKey, ModuleVisibilityItem>>
) {
  return order
    .map((key) => itemsByKey[key])
    .filter((item): item is ModuleVisibilityItem => Boolean(item));
}
