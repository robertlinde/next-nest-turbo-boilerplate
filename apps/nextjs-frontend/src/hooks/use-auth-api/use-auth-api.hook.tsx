'use client';

import {type MutationFunction, useMutation, type UseMutationResult} from '@tanstack/react-query';
import {confirm as confirmRequest} from './services/confirm.service.ts';
import {forgotPassword as forgotPasswordRequest} from './services/forgot-password.service.ts';
import {loginCredentials as loginCredentialsRequest} from './services/login-credentials.service.ts';
import {loginTwoFactorAuth} from './services/login-two-factor.service.ts';
import {logout as logoutRequest} from './services/logout.service.ts';
import {register as registerRequest} from './services/register.service.ts';
import {resetPassword as resetPasswordRequest} from './services/reset-password.service.ts';
import {type ConfirmHandlerOptions} from './types/confirm-handler-options.type.ts';
import {type ForgotPasswordHandlerOptions} from './types/forgot-password-handler-options.type.ts';
import {type LoginCredentialsHandlerOptions} from './types/login-credentials-handler-options.type.ts';
import {type LoginTwoFactorHandlerOptions} from './types/login-two-factor-handler-options.type.ts';
import {type LogoutHandlerOptions} from './types/logout-handler-options.type.ts';
import {type RegisterHandlerOptions} from './types/register-handler-options.type.ts';
import {type ResetPasswordHandlerOptions} from './types/reset-password-handler-options.type.ts';
import {useUserStore} from '@/store/user.store.ts';
import type {ApiError} from '@/utils/api/api-error';

/**
 * A custom hook to create an API mutation using react-query.
 *
 * @param {MutationFunction} mutationFn - The mutation function to execute.
 * @returns {UseMutationResult<unknown, ApiError>} The mutation result.
 */
const useApiMutation = (mutationFn: MutationFunction): UseMutationResult<unknown, ApiError> =>
  useMutation({
    mutationFn,
  });

/**
 * A custom hook that provides methods for various authentication-related actions such as login,
 * logout, registration, confirmation, and password reset.
 *
 * @returns {{
 *   loginCredentials: (options: LoginCredentialsHandlerOptions) => Promise<void>,
 *   loginTwoFactor: (options: LoginTwoFactorHandlerOptions) => Promise<void>,
 *   register: (options: RegisterHandlerOptions) => Promise<void>,
 *   confirm: (options: ConfirmHandlerOptions) => Promise<void>,
 *   forgotPassword: (options: ForgotPasswordHandlerOptions) => Promise<void>,
 *   resetPassword: (options: ResetPasswordHandlerOptions) => Promise<void>,
 *   logout: (options?: LogoutHandlerOptions) => Promise<void>
 * }} Authentication methods.
 */
export function useAuthApi(): {
  loginCredentials: (options: LoginCredentialsHandlerOptions) => Promise<void>;
  loginTwoFactor: (options: LoginTwoFactorHandlerOptions) => Promise<void>;
  register: (options: RegisterHandlerOptions) => Promise<void>;
  confirm: (options: ConfirmHandlerOptions) => Promise<void>;
  forgotPassword: (options: ForgotPasswordHandlerOptions) => Promise<void>;
  resetPassword: (options: ResetPasswordHandlerOptions) => Promise<void>;
  logout: (options?: LogoutHandlerOptions) => Promise<void>;
} {
  const loadUser = useUserStore((state) => state.loadUser);
  const logoutAuth = useUserStore((state) => state.logout);

  const loginMutation = useApiMutation(loginCredentialsRequest as MutationFunction);
  const loginTwoFactorMutation = useApiMutation(loginTwoFactorAuth as MutationFunction);
  const registerMutation = useApiMutation(registerRequest as MutationFunction);
  const confirmMutation = useApiMutation(confirmRequest as MutationFunction);
  const forgotPasswordMutation = useApiMutation(forgotPasswordRequest as MutationFunction);
  const resetPasswordMutation = useApiMutation(resetPasswordRequest as MutationFunction);
  const logoutMutation = useApiMutation(logoutRequest);

  /**
   * Executes an API mutation and handles success and error callbacks.
   *
   * @param {UseMutationResult<unknown, unknown>} mutation - The mutation to execute.
   * @param {unknown} data - Data to pass to the mutation.
   * @param {() => void | Promise<void>} [onSuccess] - Callback for successful mutation.
   * @param {(error: ApiError) => void | Promise<void>} [onError] - Callback for mutation error.
   * @returns {Promise<void>} A promise that resolves once the mutation completes.
   */
  const handleMutation = async (
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
   *
   * @param {LoginCredentialsHandlerOptions} options - Login options and callbacks.
   * @returns {Promise<void>}
   */
  const loginCredentials = async ({data, onSuccess, onError}: LoginCredentialsHandlerOptions): Promise<void> => {
    await handleMutation(
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
   *
   * @param {LoginTwoFactorHandlerOptions} options - Two-factor login options and callbacks.
   * @returns {Promise<void>}
   */
  const loginTwoFactor = async ({data, onSuccess, onError}: LoginTwoFactorHandlerOptions): Promise<void> => {
    await handleMutation(
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
   *
   * @param {RegisterHandlerOptions} options - Registration options and callbacks.
   * @returns {Promise<void>}
   */
  const register = async ({data, onSuccess, onError}: RegisterHandlerOptions): Promise<void> => {
    await handleMutation(registerMutation, data, onSuccess, onError);
  };

  /**
   * Confirms a user's email using a token.
   *
   * @param {ConfirmHandlerOptions} options - Confirmation options including token and callbacks.
   * @returns {Promise<void>}
   * @throws {Error} If the token is missing.
   */
  const confirm = async ({onSuccess, onError, token}: ConfirmHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleMutation(confirmMutation, token, onSuccess, onError);
  };

  /**
   * Initiates a password reset email.
   *
   * @param {ForgotPasswordHandlerOptions} options - Forgot password options and callbacks.
   * @returns {Promise<void>}
   */
  const forgotPassword = async ({data, onSuccess, onError}: ForgotPasswordHandlerOptions): Promise<void> => {
    await handleMutation(forgotPasswordMutation, data, onSuccess, onError);
  };

  /**
   * Resets a user's password using a token.
   *
   * @param {ResetPasswordHandlerOptions} options - Reset password options, including token and callbacks.
   * @returns {Promise<void>}
   * @throws {Error} If the token is missing.
   */
  const resetPassword = async ({data, onSuccess, onError, token}: ResetPasswordHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleMutation(resetPasswordMutation, {...data, token}, onSuccess, onError);
  };

  /**
   * Logs the user out and clears local auth state.
   *
   * @param {LogoutHandlerOptions} [options] - Optional logout callbacks.
   * @returns {Promise<void>}
   */
  const logout = async ({onSuccess, onError}: LogoutHandlerOptions = {}): Promise<void> => {
    logoutAuth();
    await handleMutation(logoutMutation, undefined, onSuccess, onError);
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
