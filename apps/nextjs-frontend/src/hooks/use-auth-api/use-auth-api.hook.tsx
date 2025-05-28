'use client';

import {type ConfirmHandlerOptions} from './hooks/use-confirm/types/confirm-handler-options.type.ts';
import {useConfirm} from './hooks/use-confirm/use-confirm.hook.tsx';
import {type ForgotPasswordHandlerOptions} from './hooks/use-forgot-password/types/forgot-password-handler-options.type.ts';
import {useForgotPassword} from './hooks/use-forgot-password/use-forgot-password.hook.tsx';
import {type LoginCredentialsHandlerOptions} from './hooks/use-login-credentials/types/login-credentials-handler-options.type.ts';
import {useLoginCredentials} from './hooks/use-login-credentials/use-login-credentials.hook.tsx';
import {type LoginTwoFactorHandlerOptions} from './hooks/use-login-two-factor/types/login-two-factor-handler-options.type.ts';
import {useLoginTwoFactor} from './hooks/use-login-two-factor/use-login-two-factor.hook.tsx';
import {type LogoutHandlerOptions} from './hooks/use-logout/types/logout-handler-options.type.ts';
import {useLogout} from './hooks/use-logout/use-logout.hook.tsx';
import {type RegisterHandlerOptions} from './hooks/use-register/types/register-handler-options.type.ts';
import {useRegister} from './hooks/use-register/use-register.hook.tsx';
import {type ResetPasswordHandlerOptions} from './hooks/use-reset-password/types/reset-password-handler-options.type.ts';
import {useResetPassword} from './hooks/use-reset-password/use-reset-password.hook.tsx';

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
