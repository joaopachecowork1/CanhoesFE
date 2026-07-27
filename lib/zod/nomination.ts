import { z } from "zod";

export const CreateNomineeSchema = z.object({
  categoryId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required").max(256),
  targetUserId: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
});

export const CreateMeasureProposalSchema = z.object({
  text: z.string().min(1, "Text is required").max(1000),
});
