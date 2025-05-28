import {type ApiError} from '@/utils/api/api-error.ts';

export type BaseAuth = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: ApiError) => void | Promise<void>;
};
