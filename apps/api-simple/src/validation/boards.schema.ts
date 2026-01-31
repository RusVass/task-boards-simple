import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1, 'name is required'),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, 'name is required'),
});

export type CreateBoardDto = z.infer<typeof createBoardSchema>;
export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;
