import {z} from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email().max(100, 'Email must be at most 100 characters long')),
  username: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(4, 'Username must be at least 4 characters long')
        .max(20, 'Username must be at most 20 characters long'),
    ),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters long')
    .max(128, 'Password must be at most 128 characters long'),
});
