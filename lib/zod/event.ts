import { z } from "zod";
import { AwardCategoryKindEnum, EventPhaseTypeEnum } from "./common";

export const EventSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
});

export const EventPhaseSchema = z.object({
  id: z.string(),
  type: EventPhaseTypeEnum,
  startDateUtc: z.string(),
  endDateUtc: z.string(),
  isActive: z.boolean(),
});

export const EventAdminModuleVisibilitySchema = z.object({
  feed: z.boolean(),
  secretSanta: z.boolean(),
  wishlist: z.boolean(),
  categories: z.boolean(),
  voting: z.boolean(),
  gala: z.boolean(),
  stickers: z.boolean(),
  measures: z.boolean(),
  nominees: z.boolean(),
});

export const CreateAwardCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  sortOrder: z.number().int().nullable().optional(),
  kind: AwardCategoryKindEnum,
  description: z.string().max(1000).nullable().optional(),
  voteQuestion: z.string().max(256).nullable().optional(),
  voteRules: z.string().nullable().optional(),
});

export const UpdateAwardCategorySchema = z.object({
  name: z.string().min(1).max(128).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  kind: AwardCategoryKindEnum.optional(),
  description: z.string().max(1000).nullable().optional(),
  voteQuestion: z.string().max(256).nullable().optional(),
  voteRules: z.string().nullable().optional(),
});

export const UpdateEventAdminStateSchema = z.object({
  nominationsVisible: z.boolean().optional(),
  resultsVisible: z.boolean().optional(),
  moduleVisibility: EventAdminModuleVisibilitySchema.optional(),
});

export const UpdateEventPhaseSchema = z.object({
  phaseType: EventPhaseTypeEnum,
});

export const UpdateEventModulesSchema = z.object({
  modules: EventAdminModuleVisibilitySchema,
});

export const CreateEventSecretSantaDrawSchema = z.object({
  eventCode: z.string().optional(),
});

export const UpdateAdminCategoryProposalSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const UpdateMeasureProposalSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const SetNomineeCategorySchema = z.object({
  categoryId: z.string().nullable().optional(),
});
