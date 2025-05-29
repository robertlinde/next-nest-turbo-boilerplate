'use client';

import {useMutation, type UseMutationResult} from '@tanstack/react-query';
import {confirm as confirmRequest} from './services/confirm.service.ts';
import {forgotPassword as forgotPasswordRequest} from './services/forgot-password.service.ts';
import {loginCredentials as loginCredentialsRequest} from './services/login-credentials.service.ts';
import {loginTwoFactorAuth} from './services/login-two-factor.service.ts';
import {logout as logoutRequest} from './services/logout.service.ts';
import {register as registerRequest} from './services/register.service.ts';
import {resetPassword as resetPasswordRequest} from './services/reset-password.service.ts';
import {type ConfirmParams} from './services/types/confirm.params.type.ts';
import {type ForgotPasswordParams} from './services/types/forgot-password.params.type.ts';
import {type LoginCredentialsParams} from './services/types/login-credentials.params.type.ts';
import {type LoginTwoFactorParams} from './services/types/login-two-factor.params.type.ts';
import {type RegisterParams} from './services/types/register.params.type.ts';
import {type ResetPasswordParams} from './services/types/reset-password.params.type.ts';
import {type BaseAuth} from './types/base-auth.type.ts';
import {type MutationState} from './types/mutation-state.type.ts';
import {useUserStore} from '@/store/user.store.ts';
import type {ApiError} from '@/utils/api/api-error.ts';

/**
 * Enhanced authentication hook with cleaner implementation
 */
export function useAuthApi(): {
  loginCredentials: (parameters: BaseAuth & LoginCredentialsParams) => Promise<void>;
  loginTwoFactor: (parameters: BaseAuth & LoginTwoFactorParams) => Promise<void>;
  register: (parameters: BaseAuth & RegisterParams) => Promise<void>;
  confirm: (parameters: BaseAuth & ConfirmParams) => Promise<void>;
  forgotPassword: (parameters: BaseAuth & ForgotPasswordParams) => Promise<void>;
  resetPassword: (parameters: BaseAuth & ResetPasswordParams) => Promise<void>;
  logout: (parameters?: BaseAuth) => Promise<void>;
  state: Record<string, MutationState>;
} {
  const loadUser = useUserStore((state) => state.loadUser);
  const logoutAuth = useUserStore((state) => state.logout);

  // Create mutations using a helper to reduce repetition
  const useCreateMutation = (
    mutationFn: (...args: any[]) => any | Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): UseMutationResult<unknown, ApiError> =>
    useMutation({
      mutationFn,
    });

  const mutations = {
    loginCredentials: useCreateMutation(loginCredentialsRequest),
    loginTwoFactor: useCreateMutation(loginTwoFactorAuth),
    register: useCreateMutation(registerRequest),
    confirm: useCreateMutation(confirmRequest),
    forgotPassword: useCreateMutation(forgotPasswordRequest),
    resetPassword: useCreateMutation(resetPasswordRequest),
    logout: useCreateMutation(logoutRequest),
  };

  // Generic helper for executing mutations with consistent error handling
  const executeMutation = async (
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

      throw error; // Re-throw for upstream handling
    }
  };

  return {
    /**
     * Authenticate user with credentials
     */
    async loginCredentials({data, onSuccess, onError}: BaseAuth & LoginCredentialsParams): Promise<void> {
      await executeMutation(mutations.loginCredentials, data, onSuccess, onError);
    },

    /**
     * Complete two-factor authentication and load user data
     */
    async loginTwoFactor({data, onSuccess, onError}: BaseAuth & LoginTwoFactorParams): Promise<void> {
      await executeMutation(
        mutations.loginTwoFactor,
        data,
        async () => {
          await loadUser();
          await onSuccess?.();
        },
        onError,
      );
    },

    /**
     * Register new user
     */
    async register({data, onSuccess, onError}: BaseAuth & RegisterParams): Promise<void> {
      await executeMutation(mutations.register, data, onSuccess, onError);
    },

    /**
     * Confirm user email with token
     */
    async confirm({token, onSuccess, onError}: BaseAuth & ConfirmParams): Promise<void> {
      if (!token) {
        throw new Error('Token is required for email confirmation');
      }

      await executeMutation(mutations.confirm, {token}, onSuccess, onError);
    },

    /**
     * Request password reset email
     */
    async forgotPassword({data, onSuccess, onError}: BaseAuth & ForgotPasswordParams): Promise<void> {
      await executeMutation(mutations.forgotPassword, data, onSuccess, onError);
    },

    /**
     * Reset password with token
     */
    async resetPassword({data, token, onSuccess, onError}: BaseAuth & ResetPasswordParams): Promise<void> {
      if (!token) {
        throw new Error('Token is required for password reset');
      }

      await executeMutation(mutations.resetPassword, {...data, token}, onSuccess, onError);
    },

    /**
     * Logout user and clear local state
     */
    async logout({onSuccess, onError}: BaseAuth = {}): Promise<void> {
      logoutAuth();
      await executeMutation(mutations.logout, undefined, onSuccess, onError);
    },

    // Expose selected mutation properties for accessing loading states, etc.
    state: Object.fromEntries(
      Object.entries(mutations).map(([key, mutation]) => [
        key,
        {
          isPending: mutation.isPending,
          isError: mutation.isError,
          isSuccess: mutation.isSuccess,
          isIdle: mutation.isIdle,
          error: mutation.error,
        },
      ]),
    ) as Record<string, MutationState>,
  };
}
