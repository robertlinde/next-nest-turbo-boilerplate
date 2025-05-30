import {type ApiError} from '@/utils/api/api-error.ts';

export type AuthHookParams<T = undefined> = T extends undefined
  ? {
    onSuccess?: () => void | Promise<void>;
    onError?: (error: ApiError) => void | Promise<void>;
    onSettled?: () => void | Promise<void>;
  }
  : {
    params: T;
    onSuccess?: () => void | Promise<void>;
    onError?: (error: ApiError) => void | Promise<void>;
    onSettled?: () => void | Promise<void>;
  };
