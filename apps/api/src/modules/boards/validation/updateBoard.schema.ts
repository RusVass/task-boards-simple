import { z } from 'zod';

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

export type UpdateBoardDto = z.infer<typeof updateBoardSchema>;
