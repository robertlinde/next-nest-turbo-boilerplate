import {type z} from 'zod';
import {type registerSchema} from './register.schema.ts';

export type RegisterFormFields = z.infer<typeof registerSchema>;
