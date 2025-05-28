'use client';

import {type MutationFunction, useMutation, type UseMutationResult} from '@tanstack/react-query';
import {confirm as confirmRequest} from './services/confirm.service.ts';
import {forgotPassword as forgotPasswordRequest} from './services/forgot-password.service.ts';
import {loginCredentials as loginCredentialsRequest} from './services/login-credentials.service.ts';
import {loginTwoFactorAuth} from './services/login-two-factor.service.ts';
import {logout as logoutRequest} from './services/logout.service.ts';
import {register as registerRequest} from './services/register.service.ts';
import {resetPassword as resetPasswordRequest} from './services/reset-password.service.ts';
import {type Confirm} from './types/confirm.type.ts';
import {type ForgotPassword} from './types/forgot-password.type.ts';
import {type LoginCredentials} from './types/login-credentials.type.ts';
import {type LoginTwoFactor} from './types/login-two-factor.type.ts';
import {type Register} from './types/register.type.ts';
import {type ResetPassword} from './types/reset-password.type.ts';
import {type BaseAuth} from './types/base-auth.type.ts';
import {useUserStore} from '@/store/user.store.ts';
import type {ApiError} from '@/utils/api/api-error';

/**
 * A custom hook to create an API mutation using react-query.
 */
const useAuthApiMutation = (mutationFn: MutationFunction): UseMutationResult<unknown, ApiError> =>
  useMutation({
    mutationFn,
  });

/**
 * A custom hook that provides methods for various authentication-related actions such as login,
 * logout, registration, confirmation, and password reset.
 */
export function useAuthApi(): {
  loginCredentials: (options: BaseAuth & LoginCredentials) => Promise<void>;
  loginTwoFactor: (options: BaseAuth & LoginTwoFactor) => Promise<void>;
  register: (options: BaseAuth & Register) => Promise<void>;
  confirm: (options: BaseAuth & Confirm) => Promise<void>;
  forgotPassword: (options: BaseAuth & ForgotPassword) => Promise<void>;
  resetPassword: (options: BaseAuth & ResetPassword) => Promise<void>;
  logout: (options?: BaseAuth) => Promise<void>;
} {
  const loadUser = useUserStore((state) => state.loadUser);
  const logoutAuth = useUserStore((state) => state.logout);

  const loginMutation = useAuthApiMutation(loginCredentialsRequest as MutationFunction);
  const loginTwoFactorMutation = useAuthApiMutation(loginTwoFactorAuth as MutationFunction);
  const registerMutation = useAuthApiMutation(registerRequest as MutationFunction);
  const confirmMutation = useAuthApiMutation(confirmRequest as MutationFunction);
  const forgotPasswordMutation = useAuthApiMutation(forgotPasswordRequest as MutationFunction);
  const resetPasswordMutation = useAuthApiMutation(resetPasswordRequest as MutationFunction);
  const logoutMutation = useAuthApiMutation(logoutRequest);

  /**
   * Executes an API mutation and handles success and error callbacks.
   */
  const handleAuthMutation = async (
    mutation: UseMutationResult<unknown, unknown>,
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

  /**
   * Authenticates a user using credentials.
   */
  const loginCredentials = async ({data, onSuccess, onError}: BaseAuth & LoginCredentials): Promise<void> => {
    await handleAuthMutation(
      loginMutation,
      data,
      async () => {
        await onSuccess?.();
      },
      onError,
    );
  };

  /**
   * Authenticates a user using two-factor authentication.
   */
  const loginTwoFactor = async ({data, onSuccess, onError}: BaseAuth & LoginTwoFactor): Promise<void> => {
    await handleAuthMutation(
      loginTwoFactorMutation,
      data,
      async () => {
        await loadUser();
        await onSuccess?.();
      },
      onError,
    );
  };

  /**
   * Registers a new user.
   */
  const register = async ({data, onSuccess, onError}: BaseAuth & Register): Promise<void> => {
    await handleAuthMutation(registerMutation, data, onSuccess, onError);
  };

  /**
   * Confirms a user's email using a token.
   */
  const confirm = async ({onSuccess, onError, token}: BaseAuth & Confirm): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleAuthMutation(confirmMutation, {token}, onSuccess, onError);
  };

  /**
   * Initiates a password reset email.
   */
  const forgotPassword = async ({data, onSuccess, onError}: BaseAuth & ForgotPassword): Promise<void> => {
    await handleAuthMutation(forgotPasswordMutation, data, onSuccess, onError);
  };

  /**
   * Resets a user's password using a token.
   */
  const resetPassword = async ({data, onSuccess, onError, token}: BaseAuth & ResetPassword): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleAuthMutation(resetPasswordMutation, {...data, token}, onSuccess, onError);
  };

  /**
   * Logs the user out and clears local auth state.
   */
  const logout = async ({onSuccess, onError}: BaseAuth = {}): Promise<void> => {
    logoutAuth();
    await handleAuthMutation(logoutMutation, undefined, onSuccess, onError);
  };

  return {
    loginCredentials,
    loginTwoFactor,
    register,
    confirm,
    forgotPassword,
    resetPassword,
    logout,
  };
}
