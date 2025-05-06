import {z} from 'zod';

export const loginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
