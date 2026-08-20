import { prisma } from "@/lib/prisma";
import type {
  PagedResult,
  CategoryProposalDto,
  MeasureProposalDto,
  GalaMeasureDto,
} from "@/lib/api/types";
import { createCategory } from "./categories";

export async function getCategoryProposals(
  eventId: string,
  status?: string | null,
  skip = 0,
  take = 50
): Promise<PagedResult<CategoryProposalDto>> {
  const where: Record<string, unknown> = { eventId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.categoryProposal.findMany({
      where,
      orderBy: [{ createdAtUtc: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.categoryProposal.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      description: p.description,
      status: p.status as "pending" | "approved" | "rejected",
      createdAtUtc: p.createdAtUtc.toISOString(),
    })),
    total, skip, take,
    hasMore: skip + take < total,
  };
}

export async function updateCategoryProposal(
  eventId: string,
  proposalId: string,
  data: { name?: string; description?: string | null; status?: string }
): Promise<CategoryProposalDto | null> {
  const proposal = await prisma.categoryProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return null;

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() ?? null;
  if (data.status !== undefined) updateData.status = data.status;

  if (data.status === "approved") {
    await createCategory(eventId, {
      name: data.name ?? proposal.name,
      kind: proposal.kind,
      description: data.description ?? proposal.description,
    });
  }

  const updated = await prisma.categoryProposal.update({
    where: { id: proposalId },
    data: updateData,
  });

  return {
    id: updated.id,
    name: updated.name,
    kind: updated.kind,
    description: updated.description,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
  };
}

export async function deleteCategoryProposal(eventId: string, proposalId: string): Promise<boolean> {
  const proposal = await prisma.categoryProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return false;
  await prisma.categoryProposal.delete({ where: { id: proposalId } });
  return true;
}

// ─────────────── MEASURE PROPOSALS ───────────────

export async function getMeasureProposals(
  eventId: string,
  status?: string | null,
  skip = 0,
  take = 50
): Promise<PagedResult<MeasureProposalDto>> {
  const where: Record<string, unknown> = { eventId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.measureProposal.findMany({
      where,
      orderBy: [{ createdAtUtc: "desc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.measureProposal.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      id: p.id,
      text: p.text,
      status: p.status as "pending" | "approved" | "rejected",
      createdAtUtc: p.createdAtUtc.toISOString(),
    })),
    total, skip, take,
    hasMore: skip + take < total,
  };
}

export async function updateMeasureProposal(
  eventId: string,
  proposalId: string,
  data: { text?: string; status?: string }
): Promise<MeasureProposalDto | null> {
  const proposal = await prisma.measureProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return null;

  const updateData: Record<string, unknown> = {};
  if (data.text !== undefined) updateData.text = data.text.trim();
  if (data.status !== undefined) updateData.status = data.status;

  const updated = await prisma.measureProposal.update({
    where: { id: proposalId },
    data: updateData,
  });

  return {
    id: updated.id,
    text: updated.text,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
  };
}

export async function deleteMeasureProposal(eventId: string, proposalId: string): Promise<boolean> {
  const proposal = await prisma.measureProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return false;
  await prisma.measureProposal.delete({ where: { id: proposalId } });
  return true;
}

export async function approveMeasureProposal(eventId: string, proposalId: string): Promise<GalaMeasureDto | null> {
  const proposal = await prisma.measureProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return null;

  const [, measure] = await prisma.$transaction([
    prisma.measureProposal.update({ where: { id: proposalId }, data: { status: "approved" } }),
    prisma.galaMeasure.create({
      data: { eventId, text: proposal.text, isActive: true },
    }),
  ]);

  return {
    id: measure.id,
    text: measure.text,
    isActive: measure.isActive,
    createdAtUtc: measure.createdAtUtc.toISOString(),
  };
}

export async function rejectMeasureProposal(eventId: string, proposalId: string): Promise<MeasureProposalDto | null> {
  const proposal = await prisma.measureProposal.findFirst({ where: { id: proposalId, eventId } });
  if (!proposal) return null;

  const updated = await prisma.measureProposal.update({
    where: { id: proposalId },
    data: { status: "rejected" },
  });

  return {
    id: updated.id,
    text: updated.text,
    status: updated.status as "pending" | "approved" | "rejected",
    createdAtUtc: updated.createdAtUtc.toISOString(),
  };
}
