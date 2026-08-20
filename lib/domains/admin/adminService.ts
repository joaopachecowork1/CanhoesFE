/**
 * @file admin/adminService.ts
 * @description Serviços de administração de eventos (ativação, bootstrap, categorias, etc.).
 * @author João Pacheco <joao.pacheco@…>
 * @date 2026-08-20
 */

import { adminRepo } from "./adminRepo";

/**
 * Ativa um evento.
 * @param eventId - ID do evento a ser ativado.
 * @throws {Error} Quando a operação falha.
 */
export async function activateEvent(eventId: string): Promise<void> {
  try {
    await adminRepo.activate(eventId);
  } catch (e: unknown) {
    // Propaga erro para o chamador
    throw e;
  }
}

/**
 * Realiza o bootstrap de um evento (cria módulos iniciais).
 * @param eventId - ID do evento.
 */
export async function bootstrapEvent(eventId: string): Promise<void> {
  try {
    await adminRepo.bootstrap(eventId);
  } catch (e: unknown) {
    throw e;
  }
}

/**
 * Cria ou atualiza uma categoria dentro de um evento.
 * @param eventId - ID do evento.
 * @param category - Dados da categoria.
 */
export async function upsertCategory(
  eventId: string,
  category: { id?: string; name: string; description?: string }
): Promise<void> {
  try {
    await adminRepo.upsertCategory(eventId, category);
  } catch (e: unknown) {
    throw e;
  }
}

/**
 * Remove uma categoria de um evento.
 * @param categoryId - ID da categoria a remover.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    await adminRepo.deleteCategory(categoryId);
  } catch (e: unknown) {
    throw e;
  }
}

// Adicione outras funções de domínio de admin aqui, seguindo o mesmo padrão.
