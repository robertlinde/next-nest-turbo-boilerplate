import {z} from 'zod';

export const loginTwoFactorSchema = z.object({
  code: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(6).max(6, 'Code must be 6 characters long')),
});
