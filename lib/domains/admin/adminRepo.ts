/**
 * @file admin/adminRepo.ts
 * @description Camada de repositório para operações de administração de eventos.
 * Utiliza Prisma para acessar o banco de dados. Cada função devolve `Promise<void>`
 * e propaga erros para serem capturados pelos serviços.
 */

import { prisma } from "@/lib/database/prisma"; // ajuste o caminho conforme a sua configuração Prisma

/**
 * Ativa um evento definindo seu estado como "active".
 */
export async function activate(eventId: string): Promise<void> {
  await prisma.event.update({
    where: { id: eventId },
    data: { state: "active" },
  });
}

/**
 * Executa o bootstrap de um evento criando módulos padrão.
 */
export async function bootstrap(eventId: string): Promise<void> {
  // Exemplo simplificado – crie módulos padrão do evento
  await prisma.module.createMany({
    data: [
      { eventId, name: "feed" },
      { eventId, name: "voting" },
      { eventId, name: "admin" },
    ],
    skipDuplicates: true,
  });
}

/**
 * Insere ou atualiza uma categoria.
 */
export async function upsertCategory(
  eventId: string,
  category: { id?: string; name: string; description?: string }
): Promise<void> {
  if (category.id) {
    await prisma.category.update({
      where: { id: category.id },
      data: { name: category.name, description: category.description },
    });
  } else {
    await prisma.category.create({
      data: {
        eventId,
        name: category.name,
        description: category.description,
      },
    });
  }
}

/**
 * Remove uma categoria.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await prisma.category.delete({ where: { id: categoryId } });
}

export const adminRepo = { activate, bootstrap, upsertCategory, deleteCategory };
