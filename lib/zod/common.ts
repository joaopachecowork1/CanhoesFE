import { z } from "zod";

export const ProposalStatusEnum = z.enum(["pending", "approved", "rejected"]);
export type ProposalStatus = z.infer<typeof ProposalStatusEnum>;

export const EventPhaseTypeEnum = z.enum(["DRAW", "PROPOSALS", "VOTING", "RESULTS"]);

export const AwardCategoryKindEnum = z.enum(["Sticker", "UserVote"]);

export const EventRoleEnum = z.enum(["admin", "user"]);

export const PagedParamsSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(200).default(50),
});
