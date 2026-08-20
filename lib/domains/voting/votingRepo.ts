/**
 * @file voting/votingRepo.ts
 * @description Repositório do domínio Voting. Centraliza as chamadas Prisma
 * relacionadas ao quadro de votação, registro de votos e fechamento de votação.
 */



/**
 * Obtém o quadro de votação (voting board) para um usuário em um evento.
 * @param eventId - ID do evento.
 * @param userId - ID do usuário.
 * @returns Um objeto contendo o board ou `null` se não existir.
 */
export async function getVotingBoard(_eventId: string, _userId: string) {
  throw new Error("Not implemented in schema yet");
}

/**
 * Registra um voto em uma proposta.
 * @param eventId - ID do evento.
 * @param proposalId - ID da proposta a ser votada.
 * @param userId - ID do usuário que vota.
 * @param choice - Valor da escolha (ex.: "yes", "no").
 */
export async function castVote(_eventId: string, _proposalId: string, _userId: string, _choice: string) {
  throw new Error("Not implemented in schema yet");
}

/**
 * Fecha a votação de um evento, impedindo novos votos.
 * @param eventId - ID do evento.
 */
export async function closeVoting(_eventId: string) {
  throw new Error("Not implemented in schema yet");
}

export const votingRepo = { getVotingBoard, castVote, closeVoting };
