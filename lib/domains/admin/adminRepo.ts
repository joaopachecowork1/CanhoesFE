/**
 * @file admin/adminRepo.ts
 * @description Camada de repositório para operações de administração de eventos.
 * Utiliza Prisma para acessar o banco de dados. Cada função devolve `Promise<void>`
 * e propaga erros para serem capturados pelos serviços.
 */

import { prisma } from "@/lib/prisma";

/**
 * Ativa um evento definindo seu estado como "active".
 */
export async function activate(eventId: string): Promise<void> {
  await prisma.event.update({
    where: { id: eventId },
    data: { isActive: true },
  });
}

/**
 * Executa o bootstrap de um evento criando módulos padrão.
 */
export async function bootstrap(_eventId: string): Promise<void> {
  // Logic removed because 'module' does not exist in schema.
}

/**
 * Insere ou atualiza uma categoria.
 */
export async function upsertCategory(
  eventId: string,
  category: { id?: string; name: string; description?: string }
): Promise<void> {
  if (category.id) {
    await prisma.awardCategory.update({
      where: { id: category.id },
      data: { name: category.name, description: category.description },
    });
  } else {
    await prisma.awardCategory.create({
      data: {
        eventId,
        name: category.name,
        description: category.description,
        sortOrder: 0,
        kind: 0,
        isActive: true,
      },
    });
  }
}

/**
 * Remove uma categoria.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  await prisma.awardCategory.delete({ where: { id: categoryId } });
}

export const adminRepo = { activate, bootstrap, upsertCategory, deleteCategory };
