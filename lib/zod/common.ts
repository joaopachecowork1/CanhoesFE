import { z } from "zod";

export const PagedParamsSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).max(1000).default(50),
});
