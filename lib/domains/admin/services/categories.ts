import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AwardCategoryDto,
  AwardCategorySummaryDto,
} from "@/lib/api/types";
export async function getAdminCategories(eventId: string): Promise<AwardCategoryDto[]> {
  const categories = await prisma.awardCategory.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    kind: c.kind,
    description: c.description,
    voteQuestion: c.voteQuestion,
    voteRules: c.voteRules as string | null,
  }));
}

export async function createCategory(
  eventId: string,
  data: { name: string; sortOrder?: number | null; kind: number; description?: string | null; voteQuestion?: string | null; voteRules?: string | null }
): Promise<AwardCategoryDto> {
  const maxSort = await prisma.awardCategory.aggregate({
    where: { eventId },
    _max: { sortOrder: true },
  });
  const nextSort = data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;

  const category = await prisma.awardCategory.create({
    data: {
      eventId,
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      kind: data.kind,
      sortOrder: nextSort,
      isActive: true,
      voteQuestion: data.voteQuestion?.trim() ?? null,
      voteRules: data.voteRules ?? Prisma.JsonNull,
    },
  });

  return {
    id: category.id,
    name: category.name,
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    kind: category.kind,
    description: category.description,
    voteQuestion: category.voteQuestion,
    voteRules: typeof category.voteRules === "string" ? category.voteRules : JSON.stringify(category.voteRules),
  };
}

export async function updateCategory(
  eventId: string,
  categoryId: string,
  data: Partial<{ name: string; sortOrder: number; isActive: boolean; kind: number; description: string | null; voteQuestion: string | null; voteRules: string | null }>
): Promise<AwardCategoryDto | null> {
  const existing = await prisma.awardCategory.findFirst({ where: { id: categoryId, eventId } });
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.kind !== undefined) updateData.kind = data.kind;
  if (data.description !== undefined) updateData.description = data.description?.trim() ?? null;
  if (data.voteQuestion !== undefined) updateData.voteQuestion = data.voteQuestion?.trim() ?? null;
  if (data.voteRules !== undefined) updateData.voteRules = data.voteRules ?? Prisma.JsonNull;

  const updated = await prisma.awardCategory.update({
    where: { id: categoryId },
    data: updateData,
  });

  return {
    id: updated.id,
    name: updated.name,
    sortOrder: updated.sortOrder,
    isActive: updated.isActive,
    kind: updated.kind,
    description: updated.description,
    voteQuestion: updated.voteQuestion,
    voteRules: typeof updated.voteRules === "string" ? updated.voteRules : JSON.stringify(updated.voteRules),
  };
}

export async function deleteCategory(eventId: string, categoryId: string): Promise<boolean> {
  const existing = await prisma.awardCategory.findFirst({ where: { id: categoryId, eventId } });
  if (!existing) return false;

  const hasDependents = await Promise.all([
    prisma.nominee.count({ where: { eventId, categoryId } }),
    prisma.vote.count({ where: { categoryId } }),
    prisma.userVote.count({ where: { categoryId } }),
  ]);

  if (hasDependents.some((c) => c > 0)) return false;

  await prisma.awardCategory.delete({ where: { id: categoryId } });
  return true;
}

export async function getAdminCategoriesSummary(eventId: string): Promise<AwardCategorySummaryDto[]> {
  const categories = await prisma.awardCategory.findMany({
    where: { eventId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, sortOrder: true, isActive: true, kind: true },
  });
  return categories;
}
