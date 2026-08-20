/**
 * @file feed/feedRepo.ts
 * @description Repositório do domínio Feed. Centraliza todas as chamadas Prisma
 * relacionadas a posts, comentários e reações.
 */

import { prisma } from "@/lib/database/prisma"; // ajuste se o caminho for diferente

/** Cria um novo post no feed */
export async function createPost(eventId: string, userId: string, content: string): Promise<void> {
  await prisma.hubPost.create({
    data: { eventId, userId, content },
  });
}

/** Apaga um post existente */
export async function deletePost(postId: string): Promise<void> {
  await prisma.hubPost.delete({ where: { id: postId } });
}

/** Alterna reação (like/dislike) usando a emoji "heart" para like */
export async function toggleReaction(eventId: string, postId: string, userId: string, emoji: string): Promise<void> {
  // Simplificado: remove reação existente e cria nova
  await prisma.hubPostReaction.deleteMany({ where: { postId, userId, emoji } });
  await prisma.hubPostReaction.create({ data: { postId, userId, emoji } });
}

/** Marca um post como destacado (pin) */
export async function pinPost(postId: string): Promise<void> {
  await prisma.hubPost.update({ where: { id: postId }, data: { pinned: true } });
}

export const feedRepo = { createPost, deletePost, toggleReaction, pinPost };
