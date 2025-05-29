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
import {type MutationState} from './types/mutation-state.type.ts';
import {type AuthHookParams} from './types/auth-hook.params.ts';
import {useUserStore} from '@/store/user.store.ts';
import type {ApiError} from '@/utils/api/api-error.ts';

/**
 * Enhanced authentication hook with cleaner implementation
 */
export function useAuthApi(): {
  loginCredentials: (params: AuthHookParams<LoginCredentialsParams>) => Promise<void>;
  loginTwoFactor: (params: AuthHookParams<LoginTwoFactorParams>) => Promise<void>;
  register: (params: AuthHookParams<RegisterParams>) => Promise<void>;
  confirm: (params: AuthHookParams<ConfirmParams>) => Promise<void>;
  forgotPassword: (params: AuthHookParams<ForgotPasswordParams>) => Promise<void>;
  resetPassword: (params: AuthHookParams<ResetPasswordParams>) => Promise<void>;
  logout: (params?: AuthHookParams) => Promise<void>;
  state: Record<string, MutationState>;
} {
  const loadUser = useUserStore((state) => state.loadUser);
  const logoutAuth = useUserStore((state) => state.logout);

  const useCreateMutation = (
    mutationFn: (...args: any[]) => any | Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): UseMutationResult<unknown, ApiError> => useMutation({mutationFn});

  const mutations = {
    loginCredentials: useCreateMutation(loginCredentialsRequest),
    loginTwoFactor: useCreateMutation(loginTwoFactorAuth),
    register: useCreateMutation(registerRequest),
    confirm: useCreateMutation(confirmRequest),
    forgotPassword: useCreateMutation(forgotPasswordRequest),
    resetPassword: useCreateMutation(resetPasswordRequest),
    logout: useCreateMutation(logoutRequest),
  };

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

      throw error;
    }
  };

  return {
    async loginCredentials({params, onSuccess, onError}: AuthHookParams<LoginCredentialsParams>): Promise<void> {
      await executeMutation(mutations.loginCredentials, params, onSuccess, onError);
    },

    async loginTwoFactor({params, onSuccess, onError}: AuthHookParams<LoginTwoFactorParams>): Promise<void> {
      await executeMutation(
        mutations.loginTwoFactor,
        params,
        async () => {
          await loadUser();
          await onSuccess?.();
        },
        onError,
      );
    },

    async register({params, onSuccess, onError}: AuthHookParams<RegisterParams>): Promise<void> {
      await executeMutation(mutations.register, params, onSuccess, onError);
    },

    async confirm({params, onSuccess, onError}: AuthHookParams<ConfirmParams>): Promise<void> {
      if (!params?.token) {
        throw new Error('Token is required for email confirmation');
      }

      await executeMutation(mutations.confirm, params, onSuccess, onError);
    },

    async forgotPassword({params, onSuccess, onError}: AuthHookParams<ForgotPasswordParams>): Promise<void> {
      await executeMutation(mutations.forgotPassword, params, onSuccess, onError);
    },

    async resetPassword({params, onSuccess, onError}: AuthHookParams<ResetPasswordParams>): Promise<void> {
      if (!params?.token) {
        throw new Error('Token is required for password reset');
      }

      await executeMutation(mutations.resetPassword, params, onSuccess, onError);
    },

    async logout({onSuccess, onError}: AuthHookParams = {}): Promise<void> {
      logoutAuth();
      await executeMutation(mutations.logout, undefined, onSuccess, onError);
    },

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
