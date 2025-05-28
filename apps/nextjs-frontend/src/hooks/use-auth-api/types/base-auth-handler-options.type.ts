import {type ApiError} from '@/utils/api/api-error.util';

export type BaseAuthHandlerOptions = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: ApiError) => void | Promise<void>;
};
