import {type z} from 'zod';

import {type loginTwoFactorSchema} from './login-two-factor.schema';

export type LoginTwoFactorFormFields = z.infer<typeof loginTwoFactorSchema>;
