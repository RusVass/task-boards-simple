import { z } from 'zod';

export const updateCardSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
});

export type UpdateCardDto = z.infer<typeof updateCardSchema>;
