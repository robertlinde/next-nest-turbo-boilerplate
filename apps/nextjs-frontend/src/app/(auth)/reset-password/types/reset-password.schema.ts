import {z} from 'zod';

export const resetPasswordSchema = z.object({
  password: z.string().min(4, 'Password must be at least 4 characters long'),
});
