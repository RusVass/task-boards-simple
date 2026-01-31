import { z } from 'zod';

export const cardColumnSchema = z.enum(['todo', 'in_progress', 'done']);

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
