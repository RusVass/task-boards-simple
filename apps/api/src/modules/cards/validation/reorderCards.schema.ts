import { z } from 'zod';
import { CARD_COLUMNS } from '../card.model';

export const reorderCardsSchema = z.object({
  items: z.array(
    z.object({
      cardId: z.string().min(1),
      column: z.enum(CARD_COLUMNS),
    }),
  ),
});

export type ReorderCardsDto = z.infer<typeof reorderCardsSchema>;
