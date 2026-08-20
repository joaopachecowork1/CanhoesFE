/**
 * @file feed/feedService.ts
 * @description Serviços do domínio Feed (post, comentário, reação, voto).
 */

import { feedRepo } from "./feedRepo";

/**
 * Cria um novo post.
 */
export async function createPost(eventId: string, userId: string, content: string): Promise<void> {
  await feedRepo.createPost(eventId, userId, content);
}

/**
 * Apaga um post.
 */
export async function deletePost(postId: string): Promise<void> {
  await feedRepo.deletePost(postId);
}

/**
 * Adiciona uma reação (like ou dislike).
 */
export async function toggleReaction(eventId: string, postId: string, userId: string, emoji: string): Promise<void> {
  await feedRepo.toggleReaction(eventId, postId, userId, emoji);
}

/**
 * Marca um post como destacado (pin).
 */
export async function pinPost(postId: string): Promise<void> {
  await feedRepo.pinPost(postId);
}

// Outros serviços de Feed podem ser adicionados aqui.
