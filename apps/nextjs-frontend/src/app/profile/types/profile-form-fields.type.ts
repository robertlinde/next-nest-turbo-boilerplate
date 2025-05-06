import {type z} from 'zod';

import {type profileSchema} from './profile.schema';

export type ProfileFormFields = z.infer<typeof profileSchema>;
