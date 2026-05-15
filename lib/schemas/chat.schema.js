import { z } from "zod";

export const sendQuerySchema = z.object({
  question: z.string().min(1, "Question is required"),
  conversationId: z.string().optional(),
});