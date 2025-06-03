import {z} from 'zod';

export const loginCredentialsSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email()),
  password: z.string(),
});
