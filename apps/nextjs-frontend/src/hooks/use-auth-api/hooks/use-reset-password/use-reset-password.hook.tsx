import {type ResetPasswordHandlerOptions} from './types/reset-password-handler-options.type';
import {type ResetPasswordParams} from './types/reset-password-params.type.ts';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util.ts';

export const useResetPassword = (): {
  resetPassword: (options: ResetPasswordHandlerOptions) => Promise<void>;
} => {
  const resetPasswordRequest = async (data: ResetPasswordParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/confirm`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

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
