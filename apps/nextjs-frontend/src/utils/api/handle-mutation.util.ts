import {type UseMutationResult} from '@tanstack/react-query';
import {type ApiError} from './api-error.util.ts';

/**
 * Executes an API mutation and handles success and error callbacks.
 */
export const handleMutation = async (
  mutation: UseMutationResult<unknown, ApiError>,
  data: unknown,
  onSuccess?: () => void | Promise<void>,
  onError?: (error: ApiError) => void | Promise<void>,
): Promise<void> => {
  try {
    await mutation.mutateAsync(data);
    await onSuccess?.();
  } catch (error) {
    if (error instanceof Error) {
      await onError?.(error as ApiError);
    }
  }
};
