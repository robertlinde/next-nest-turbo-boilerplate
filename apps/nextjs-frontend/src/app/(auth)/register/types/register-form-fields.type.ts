import {type z} from 'zod';

import {type registerSchema} from './register.schema';

export type RegisterFormFields = z.infer<typeof registerSchema>;
