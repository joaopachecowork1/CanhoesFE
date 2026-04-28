import type { EventPhaseDto } from "@/lib/api/types";

export const OPEN_COMPOSE_SHEET_EVENT = "canhoes:openCompose";


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


