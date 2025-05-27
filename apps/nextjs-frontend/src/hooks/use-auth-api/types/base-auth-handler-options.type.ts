import {type ApiError} from '@/utils/api/api-error.ts';

export type BaseAuthHandlerOptions = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: ApiError) => void | Promise<void>;
};
