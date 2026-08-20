/**
 * @file voting/votingRepo.ts
 * @description Repositório do domínio Voting. Centraliza as chamadas Prisma
 * relacionadas ao quadro de votação, registro de votos e fechamento de votação.
 */

import { prisma } from "@/lib/database/prisma"; // ajuste o caminho caso necessário

/**
 * Obtém o quadro de votação (voting board) para um usuário em um evento.
 * @param eventId - ID do evento.
 * @param userId - ID do usuário.
 * @returns Um objeto contendo o board ou `null` se não existir.
 */
export async function getVotingBoard(eventId: string, userId: string): Promise<unknown> {
  return fetchVotingBoard(eventId, userId);
}
  // Exemplo simplificado – adapte ao seu modelo Prisma real
  return prisma.votingBoard.findFirst({
    where: { eventId, participants: { some: { userId } } },
    include: { proposals: true, votes: true },
  });
}

/**
 * Internal helper to fetch the voting board from Prisma.
 */
async function fetchVotingBoard(eventId: string, userId: string) {
  return prisma.votingBoard.findFirst({
    where: { eventId, participants: { some: { userId } } },
    include: { proposals: true, votes: true },
  });
}

/**
 * Registra um voto em uma proposta.
 * @param eventId - ID do evento.
 * @param proposalId - ID da proposta a ser votada.
 * @param userId - ID do usuário que vota.
 * @param choice - Valor da escolha (ex.: "yes", "no").
 */
export async function castVote(eventId: string, proposalId: string, userId: string, choice: string): Promise<void> {
  await prisma.vote.create({
    data: { eventId, proposalId, userId, choice },
  });
}

/**
 * Fecha a votação de um evento, impedindo novos votos.
 * @param eventId - ID do evento.
 */
export async function closeVoting(eventId: string): Promise<void> {
  await prisma.event.update({
    where: { id: eventId },
    data: { votingClosed: true },
  });
}

export const votingRepo = { getVotingBoard, castVote, closeVoting };
