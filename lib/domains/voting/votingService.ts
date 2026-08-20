/**
 * @file voting/votingService.ts
 * @description Serviços do domínio Voting (votar, fechar votação, etc.).
 */

import { votingRepo } from "./votingRepo";

/**
 * Regista um voto em uma proposta.
 */
export async function castVote(eventId: string, proposalId: string, userId: string, choice: string): Promise<void> {
  await votingRepo.castVote(eventId, proposalId, userId, choice);
}

/**
 * Fecha a votação de um evento.
 */
export async function closeVoting(eventId: string): Promise<void> {
  await votingRepo.closeVoting(eventId);
}

// Outras funções de votação podem ser adicionadas aqui.
