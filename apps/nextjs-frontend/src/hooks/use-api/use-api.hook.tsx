import {
  type MutationFunction,
  useMutation as useReactQueryMutation,
  type UseMutationResult,
} from '@tanstack/react-query';
import {type ApiError} from '@/utils/api/api-error.util.ts';

export const useApi = (): {
  useMutation: (mutationFn: MutationFunction) => UseMutationResult<unknown, ApiError>;
  handleMutation: (
  mutation: UseMutationResult<unknown, ApiError>,
  data: unknown,
  onSuccess?: () => void | Promise<void>,
  onError?: (error: ApiError) => void | Promise<void>,
  ) => Promise<void>;
} => {
  /**
   * A custom hook to create an API mutation using react-query.
   */
  const useMutation = (mutationFn: MutationFunction): UseMutationResult<unknown, ApiError> =>
    useReactQueryMutation({
      mutationFn,
    });

  /**
   * Executes an API mutation and handles success and error callbacks.
   */
  const handleMutation = async (
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

  return {
    useMutation,
    handleMutation,
  };
};
