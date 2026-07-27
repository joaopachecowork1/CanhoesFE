import { z } from "zod";

export const CreateFeedPostSchema = z.object({
  text: z.string().min(1).max(4000),
  mediaUrl: z.string().max(1024).nullable().optional(),
  mediaUrls: z.array(z.string().max(1024)).optional(),
  pollQuestion: z.string().max(512).nullable().optional(),
  pollOptions: z.array(z.string().max(256)).optional(),
});

export const CreateFeedCommentSchema = z.object({
  text: z.string().min(1, "Text is required").max(2000),
});

export const ToggleFeedReactionSchema = z.object({
  emoji: z.string().max(16).optional(),
});

export const VoteFeedPollSchema = z.object({
  optionId: z.string().min(1, "optionId is required"),
});
