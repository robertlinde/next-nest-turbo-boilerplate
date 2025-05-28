import {type ResetPasswordHandlerOptions} from './types/reset-password-handler-options.type';
import {resetPassword as resetPasswordRequest} from './reset-password.service.ts';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';

export const useResetPassword = (): {
  resetPassword: (options: ResetPasswordHandlerOptions) => Promise<void>;
} => {
  const {sendRequest} = useApi(resetPasswordRequest);

  /**
   * Resets a user's password using a token.
   */
  const resetPassword = async ({data, onSuccess, onError, token}: ResetPasswordHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await sendRequest({...data, token}, onSuccess, onError);
  };

  return {
    resetPassword,
  };
};
