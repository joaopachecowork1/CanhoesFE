import { z } from "zod";

export const ProposalStatusSchema = z.enum(["pending", "approved", "rejected"]);
