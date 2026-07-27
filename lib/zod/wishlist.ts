import { z } from "zod";

export const CreateWishlistItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(256),
  url: z.string().max(1024).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});
