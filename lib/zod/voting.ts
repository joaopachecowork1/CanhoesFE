import { z } from "zod";

export const CreateEventVoteSchema = z.object({
  categoryId: z.string().min(1),
  selectionId: z.string().min(1),
});

export const CreateEventProposalSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  description: z.string().max(1000).nullable().optional(),
  kind: z.number().int().optional().default(0),
});

export const UpdateEventProposalSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
