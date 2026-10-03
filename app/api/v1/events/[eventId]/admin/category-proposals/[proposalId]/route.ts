import { z } from "zod";

import { notFound } from "@/lib/api/httpError";
import { requireAdmin } from "@/lib/api/guards";
import { apiRoute, json, noContent, readJson } from "@/lib/api/route";
import { deleteCategoryProposal, updateCategoryProposal } from "@/lib/domains/admin/services/proposals";
import { ProposalStatusSchema } from "@/lib/zod/common";

const updateProposalSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  status: ProposalStatusSchema.optional(),
});

type ProposalParams = { eventId: string; proposalId: string };

export const PUT = apiRoute<ProposalParams>(async (request, { eventId, proposalId }) => {
  await requireAdmin();
  const changes = await readJson(request, updateProposalSchema);
  const updated = await updateCategoryProposal(eventId, proposalId, changes);
  if (!updated) throw notFound("Proposal not found.");
  return json(updated);
});

export const DELETE = apiRoute<ProposalParams>(async (_request, { eventId, proposalId }) => {
  await requireAdmin();
  const deleted = await deleteCategoryProposal(eventId, proposalId);
  if (!deleted) throw notFound("Proposal not found.");
  return noContent();
});
