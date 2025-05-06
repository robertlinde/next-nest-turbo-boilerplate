import {type z} from 'zod';

import {type forgotPasswordSchema} from './forgot-password.schema';

export type ForgotPasswordFormFields = z.infer<typeof forgotPasswordSchema>;
