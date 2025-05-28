import {type ForgotPasswordHandlerOptions} from './types/forgot-password-handler-options.type';
import {type ForgotPasswordParams} from './types/forgot-password-params.type';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util';

export const useForgotPassword = (): {
  forgotPassword: (options: ForgotPasswordHandlerOptions) => Promise<void>;
} => {
  const forgotPasswordRequest = async (data: ForgotPasswordParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/request`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  const {sendRequest} = useApi(forgotPasswordRequest);

  /**
   * Initiates a password reset email.
   */
  const forgotPassword = async ({data, onSuccess, onError}: ForgotPasswordHandlerOptions): Promise<void> => {
    await sendRequest(data, onSuccess, onError);
  };

  return {
    forgotPassword,
  };
};
