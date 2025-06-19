import {type z} from 'zod';
import {type profileSchema} from './profile.schema.ts';

export type ProfileFormFields = z.infer<typeof profileSchema>;
