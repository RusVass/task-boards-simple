import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateBoardDto = z.infer<typeof createBoardSchema>;
