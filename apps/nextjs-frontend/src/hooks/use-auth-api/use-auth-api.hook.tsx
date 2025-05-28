'use client';

import {type MutationFunction} from '@tanstack/react-query';
import {useApi} from '../use-api/use-api.hook.tsx';
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
import {handleMutation} from '@/utils/api/handle-mutation.util.ts';

/**
 * A custom hook that provides methods for various authentication-related actions such as login,
 * logout, registration, confirmation, and password reset.
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

  const {useMutation} = useApi();

  const loginMutation = useMutation(loginCredentialsRequest as MutationFunction);
  const loginTwoFactorMutation = useMutation(loginTwoFactorAuth as MutationFunction);
  const registerMutation = useMutation(registerRequest as MutationFunction);
  const confirmMutation = useMutation(confirmRequest as MutationFunction);
  const forgotPasswordMutation = useMutation(forgotPasswordRequest as MutationFunction);
  const resetPasswordMutation = useMutation(resetPasswordRequest as MutationFunction);
  const logoutMutation = useMutation(logoutRequest);

  /**
   * Authenticates a user using credentials.
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
   */
  const register = async ({data, onSuccess, onError}: RegisterHandlerOptions): Promise<void> => {
    await handleMutation(registerMutation, data, onSuccess, onError);
  };

  /**
   * Confirms a user's email using a token.
   */
  const confirm = async ({onSuccess, onError, token}: ConfirmHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleMutation(confirmMutation, token, onSuccess, onError);
  };

  /**
   * Initiates a password reset email.
   */
  const forgotPassword = async ({data, onSuccess, onError}: ForgotPasswordHandlerOptions): Promise<void> => {
    await handleMutation(forgotPasswordMutation, data, onSuccess, onError);
  };

  /**
   * Resets a user's password using a token.
   */
  const resetPassword = async ({data, onSuccess, onError, token}: ResetPasswordHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleMutation(resetPasswordMutation, {...data, token}, onSuccess, onError);
  };

  /**
   * Logs the user out and clears local auth state.
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
