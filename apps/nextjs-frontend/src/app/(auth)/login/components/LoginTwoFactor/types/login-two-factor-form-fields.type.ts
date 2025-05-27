import {type z} from 'zod';
import {type loginTwoFactorSchema} from './login-two-factor.schema.ts';

export type LoginTwoFactorFormFields = z.infer<typeof loginTwoFactorSchema>;
