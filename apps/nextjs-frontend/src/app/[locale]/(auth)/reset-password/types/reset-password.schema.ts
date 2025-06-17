import {z} from 'zod';

export const resetPasswordSchema = z.object({
  password: z.string().min(4).max(128),
});
