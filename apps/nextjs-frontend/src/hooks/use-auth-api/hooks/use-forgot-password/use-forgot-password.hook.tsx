import {type ForgotPasswordHandlerOptions} from './types/forgot-password-handler-options.type';
import {forgotPassword as forgotPasswordRequest} from './forgot-password.service';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';

export const useForgotPassword = (): {
  forgotPassword: (options: ForgotPasswordHandlerOptions) => Promise<void>;
} => {
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
