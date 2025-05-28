import {
  type MutationFunction,
  useMutation as useReactQueryMutation,
  type UseMutationResult,
} from '@tanstack/react-query';
import {type ApiError} from '@/utils/api/api-error.util';

export const useApi = (): {
  useMutation: (mutationFn: MutationFunction) => UseMutationResult<unknown, ApiError>;
} => {
  /**
   * A custom hook to create an API mutation using react-query.
   */
  const useMutation = (mutationFn: MutationFunction): UseMutationResult<unknown, ApiError> =>
    useReactQueryMutation({
      mutationFn,
    });

  return {
    useMutation,
  };
};
