import { z } from "zod";

export const CreateFeedPostSchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(4000),
  mediaUrl: z.string().max(1024).nullable().optional(),
  mediaUrls: z.array(z.string().max(1024)).max(4).nullable().optional(),
  pollQuestion: z.string().trim().max(512).nullable().optional(),
  pollOptions: z.array(z.string().trim().min(1).max(256)).max(6).nullable().optional(),
}).strict().superRefine((post, context) => {
  const hasQuestion = Boolean(post.pollQuestion);
  const options = post.pollOptions ?? [];
  if (hasQuestion && options.length < 2) {
    context.addIssue({
      code: "custom",
      message: "A poll requires at least two options.",
      path: ["pollOptions"],
    });
  }
  if (!hasQuestion && options.length > 0) {
    context.addIssue({
      code: "custom",
      message: "A poll question is required.",
      path: ["pollQuestion"],
    });
  }
  if (new Set(options.map((option) => option.toLocaleLowerCase())).size !== options.length) {
    context.addIssue({
      code: "custom",
      message: "Poll options must be unique.",
      path: ["pollOptions"],
    });
  }
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
