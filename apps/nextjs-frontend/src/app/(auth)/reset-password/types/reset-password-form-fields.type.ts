import {type z} from 'zod';

import {type resetPasswordSchema} from './reset-password.schema';

export type ResetPasswordFormFields = z.infer<typeof resetPasswordSchema>;
