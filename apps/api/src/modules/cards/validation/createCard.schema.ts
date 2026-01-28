import { z } from 'zod';
import { CARD_COLUMNS } from '../card.model';

export const createCardSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  column: z.enum(CARD_COLUMNS),
});

export type CreateCardDto = z.infer<typeof createCardSchema>;
