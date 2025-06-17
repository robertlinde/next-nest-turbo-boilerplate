import {type z} from 'zod';
import {type resetPasswordSchema} from './reset-password.schema.ts';

export type ResetPasswordFormFields = z.infer<typeof resetPasswordSchema>;
