import {type z} from 'zod';

import {type loginCredentialsSchema} from './login-credentials.schema';

export type LoginCredentialsFormFields = z.infer<typeof loginCredentialsSchema>;
