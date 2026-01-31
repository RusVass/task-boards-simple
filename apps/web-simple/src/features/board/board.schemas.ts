import { z } from 'zod';

export const normalizeString = (value: string) => value.trim();

export const boardIdSchema = z
  .string()
  .trim()
  .min(1, 'Field is required')
  .regex(/^[a-f0-9]{24}$/i, 'Board ID must be 24 hex characters');

export const boardNameSchema = z
  .string()
  .trim()
  .min(1, 'Field is required')
  .max(60, 'Max 60 characters');

export const cardSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80, 'Max 80 chars'),
  description: z.string().trim().max(500, 'Max 500 chars').optional().default(''),
});

export type BoardIdForm = z.infer<typeof boardIdSchema>;
export type BoardNameForm = z.infer<typeof boardNameSchema>;
export type CardForm = z.infer<typeof cardSchema>;
