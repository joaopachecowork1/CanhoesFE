import type { EventPhaseDto, EventSummaryDto } from "@/lib/api/types";

export const OPEN_COMPOSE_SHEET_EVENT = "canhoes:openCompose";
export const REFRESH_EVENT_OVERVIEW_EVENT = "canhoes:refreshOverview";

// --- Phase helpers ---
export function getPhaseLabel(phaseType?: string | null) {
  switch (phaseType) {
    case "DRAW":
      return "Sorteio";
    case "PROPOSALS":
      return "Propostas";
    case "VOTING":
      return "Votacao";
    case "RESULTS":
      return "Resultados";
    default:
      return "Sem fase";
  }
}

export function getPhaseSummary(phaseType?: string | null) {
  switch (phaseType) {
    case "DRAW":
      return "Confere o sorteio, percebe quem te calhou e prepara a wishlist certa.";
    case "PROPOSALS":
      return "Esta fase pede propostas, nomeacoes e alinhamento antes da votacao abrir.";
    case "VOTING":
      return "As categorias estao abertas. Fecha os teus votos antes do prazo.";
    case "RESULTS":
      return "A reta final junta resultados, gala e o fecho do ritual anual.";
    default:
      return "O evento ainda esta a ganhar forma.";
  }
}

export function formatPhaseWindow(phase?: EventPhaseDto | null) {
  if (!phase) return null;

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
  }).format(new Date(phase.endDate));
}

// --- Event helpers ---
/**
 * The shell and event home both need the same "active event or first fallback"
 * rule. Keep that decision in one place so the dashboard and navigation do not
 * drift when multiple event summaries are returned.
 */
export function pickActiveEvent(events: readonly EventSummaryDto[]) {
  return events.find((event) => event.isActive) ?? events[0] ?? null;
}

/**
 * Opens the shared compose flow owned by the shell. The FAB and any secondary
 * CTA should use this helper so post creation always lands in the same place.
 */
export function openComposeSheet() {
  if (globalThis.window === undefined) return;
  globalThis.window.dispatchEvent(new CustomEvent(OPEN_COMPOSE_SHEET_EVENT));
}
