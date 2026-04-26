import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const CreateCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(1000),
});

export const VoteSchema = z.object({
  optionId: z.string(),
});