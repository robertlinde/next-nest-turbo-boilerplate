import {z} from 'zod';

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email()),
});
