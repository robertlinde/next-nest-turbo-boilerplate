import {type ApiError} from '@/utils/api/api-error.ts';

type BaseAuthHookParams = {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: ApiError) => void | Promise<void>;
  onSettled?: () => void | Promise<void>;
};

export type AuthHookParams<T = undefined> = T extends undefined
  ? BaseAuthHookParams
  : BaseAuthHookParams & {
      params: T;
    };
