/**
 * @file feed/feedRepo.ts
 * @description Repositório do domínio Feed. Centraliza todas as chamadas Prisma
 * relacionadas a posts, comentários e reações.
 */

import { prisma } from "@/lib/prisma";

/** Cria um novo post no feed */
export async function createPost(eventId: string, userId: string, content: string): Promise<void> {
  await prisma.hubPost.create({
    data: { eventId, authorUserId: userId, text: content, isPinned: false },
  });
}

/** Apaga um post existente */
export async function deletePost(postId: string): Promise<void> {
  await prisma.hubPost.delete({ where: { id: postId } });
}

/** Alterna reação (like/dislike) usando a emoji "heart" para like */
export async function toggleReaction(_eventId: string, postId: string, userId: string, emoji: string): Promise<void> {
  // Simplificado: remove reação existente e cria nova
  await prisma.hubPostReaction.deleteMany({ where: { postId, userId, emoji } });
  await prisma.hubPostReaction.create({ data: { postId, userId, emoji } });
}

/** Marca um post como destacado (pin) */
export async function pinPost(postId: string): Promise<void> {
  await prisma.hubPost.update({ where: { id: postId }, data: { isPinned: true } });
}

export const feedRepo = { createPost, deletePost, toggleReaction, pinPost };
