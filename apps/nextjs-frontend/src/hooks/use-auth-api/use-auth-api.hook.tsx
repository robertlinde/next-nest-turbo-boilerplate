'use client';

import {useMutation, type UseMutationResult} from '@tanstack/react-query';
import {useCallback} from 'react';
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
import {useUserStore} from '@/store/user/user.store.ts';
import type {ApiError} from '@/utils/api/api-error.ts';

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
  const clearUser = useUserStore((state) => state.clearUser);

  const useCreateMutation = <ParamsType, ReturnType = void>(
    mutationFn: (args: ParamsType) => Promise<ReturnType>,
  ): UseMutationResult<ReturnType, ApiError, ParamsType> => useMutation({mutationFn});

  const mutations = {
    loginCredentials: useCreateMutation<LoginCredentialsParams>(loginCredentialsRequest),
    loginTwoFactor: useCreateMutation<LoginTwoFactorParams>(loginTwoFactorAuth),
    register: useCreateMutation<RegisterParams>(registerRequest),
    confirm: useCreateMutation<ConfirmParams>(confirmRequest),
    forgotPassword: useCreateMutation<ForgotPasswordParams>(forgotPasswordRequest),
    resetPassword: useCreateMutation<ResetPasswordParams>(resetPasswordRequest),
    logout: useCreateMutation(logoutRequest),
  };

  const executeMutation = useCallback(
    async <T,>(
      args: AuthHookParams<T> & {
        mutation: UseMutationResult<unknown, ApiError, T>;
      },
    ): Promise<void> => {
      const {mutation, onSuccess, onError, onSettled} = args;
      const params = 'params' in args ? args.params : undefined;
      try {
        await mutation.mutateAsync(params as T);
        await onSuccess?.();
      } catch (error) {
        if (error instanceof Error) {
          await onError?.(error as ApiError);
        }
      } finally {
        await onSettled?.();
      }
    },
    [],
  );

  return {
    async loginCredentials({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<LoginCredentialsParams>({
        mutation: mutations.loginCredentials,
        params,
        onSuccess,
        onError,
        onSettled,
      });
    },

    async loginTwoFactor({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<LoginTwoFactorParams>({
        mutation: mutations.loginTwoFactor,
        params,
        async onSuccess() {
          await loadUser();
          await onSuccess?.();
        },
        onError,
        onSettled,
      });
    },

    async register({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<RegisterParams>({
        mutation: mutations.register,
        params,
        onSuccess,
        onError,
        onSettled,
      });
    },

    async confirm({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<ConfirmParams>({
        mutation: mutations.confirm,
        params,
        onSuccess,
        onError,
        onSettled,
      });
    },

    async forgotPassword({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<ForgotPasswordParams>({
        mutation: mutations.forgotPassword,
        params,
        onSuccess,
        onError,
        onSettled,
      });
    },

    async resetPassword({params, onSuccess, onError, onSettled}): Promise<void> {
      await executeMutation<ResetPasswordParams>({
        mutation: mutations.resetPassword,
        params,
        onSuccess,
        onError,
        onSettled,
      });
    },

    async logout({onSuccess, onError, onSettled} = {}): Promise<void> {
      await executeMutation({
        mutation: mutations.logout,
        params: undefined,
        onSuccess,
        onError,
        onSettled,
      });
      clearUser();
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
