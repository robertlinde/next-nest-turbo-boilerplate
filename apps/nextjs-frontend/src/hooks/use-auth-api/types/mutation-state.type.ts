import {type ApiError} from '@/utils/api/api-error.ts';

/**
 * Mutation state properties exposed by the auth hook
 */
export type MutationState = {
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  error: ApiError | undefined;
};
