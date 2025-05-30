import {type ApiError} from '@/utils/api/api-error.ts';

export type LoadUserReturnType = Promise<{success: boolean; error?: ApiError}>;
