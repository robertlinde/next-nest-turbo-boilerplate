'use client';

import {type ConfirmHandlerOptions} from './handlers/confirm/types/confirm-handler-options.type.ts';
import {type LoginTwoFactorHandlerOptions} from './handlers/login-two-factor/types/login-two-factor-handler-options.type.ts';
import {type LogoutHandlerOptions} from './handlers/logout/types/logout-handler-options.type.ts';
import {type RegisterHandlerOptions} from './handlers/register/types/register-handler-options.type.ts';
import {type ResetPasswordHandlerOptions} from './handlers/reset-password/types/reset-password-handler-options.type.ts';
import {useConfirm} from './handlers/confirm/use-confirm.hook.tsx';
import {useForgotPassword} from './handlers/forgot-password/use-forgot-password.hook.tsx';
import {useResetPassword} from './handlers/reset-password/use-reset-password.hook.tsx';
import {useLoginCredentials} from './handlers/login-credentials/use-login-credentials.hook.tsx';
import {type LoginCredentialsHandlerOptions} from './handlers/login-credentials/types/login-credentials-handler-options.type.ts';
import {type ForgotPasswordHandlerOptions} from './handlers/forgot-password/types/forgot-password-handler-options.type.ts';
import {useLoginTwoFactor} from './handlers/login-two-factor/use-login-two-factor.hook.tsx';
import {useLogout} from './handlers/logout/use-logout.hook.tsx';
import {useRegister} from './handlers/register/use-register.hook.tsx';

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
  const {confirm} = useConfirm();
  const {forgotPassword} = useForgotPassword();
  const {resetPassword} = useResetPassword();
  const {loginCredentials} = useLoginCredentials();
  const {loginTwoFactor} = useLoginTwoFactor();
  const {logout} = useLogout();
  const {register} = useRegister();

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
