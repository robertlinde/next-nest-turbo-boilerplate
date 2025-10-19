import {useCallback, useRef, useState} from 'react';

export type LoadingAnimationOptions = {
  /**
   * Timeout in milliseconds after which loading will automatically stop
   */
  timeout?: number;
  /**
   * Initial loading state
   */
  initialLoading?: boolean;
};

export type UseLoadingAnimationReturn = {
  /**
   * Current loading state
   */
  isLoading: boolean;
  /**
   * Start the loading animation
   */
  startLoading: () => void;
  /**
   * Stop the loading animation
   */
  stopLoading: () => void;
  /**
   * Toggle the loading state
   */
  toggleLoading: () => void;
};

/**
 * Hook for managing loading animation states with optional timeout functionality.
 *
 * Usage:
 *
 * import {useLoadingAnimation} from '@/hooks/use-loading-animation';
 *
 * const {isLoading, startLoading, stopLoading} = useLoadingAnimation();
 *
 * // Start loading for an async operation
 * const handleSubmit = async () => {
 *   startLoading();
 *   try {
 *     await apiCall();
 *   } finally {
 *     stopLoading();
 *   }
 * };
 *
 * @param options - Configuration options for the loading animation
 * @returns Object containing loading state and control functions
 */
export const useLoadingAnimation = (options: LoadingAnimationOptions = {}): UseLoadingAnimationReturn => {
  const {timeout, initialLoading = false} = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startLoading = useCallback(() => {
    setIsLoading(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    // Set new timeout if provided
    if (timeout && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        timeoutRef.current = undefined;
      }, timeout);
    }
  }, [timeout]);

  const stopLoading = useCallback(() => {
    setIsLoading(false);

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const toggleLoading = useCallback(() => {
    if (isLoading) {
      stopLoading();
    } else {
      startLoading();
    }
  }, [isLoading, startLoading, stopLoading]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
  };
};
