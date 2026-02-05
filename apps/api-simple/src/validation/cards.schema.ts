import { z } from 'zod';
import { CARD_STATUSES, DEFAULT_CARD_STATUS, isCardStatus } from '../constants/cards';

export const cardColumnSchema = z.preprocess(
  (value) => (isCardStatus(value) ? value : DEFAULT_CARD_STATUS),
  z.enum(CARD_STATUSES),
);

export const createCardSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  column: cardColumnSchema,
});

export const updateCardSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const reorderCardsSchema = z.object({
  items: z.array(
    z.object({
      cardId: z.string().min(1),
      column: cardColumnSchema,
    }),
  ),
});

export type CreateCardDto = z.infer<typeof createCardSchema>;
export type UpdateCardDto = z.infer<typeof updateCardSchema>;
export type ReorderCardsDto = z.infer<typeof reorderCardsSchema>;
