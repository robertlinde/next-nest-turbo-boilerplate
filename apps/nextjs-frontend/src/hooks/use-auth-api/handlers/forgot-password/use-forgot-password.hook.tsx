import {type MutationFunction} from '@tanstack/react-query';
import {type ForgotPasswordHandlerOptions} from './types/forgot-password-handler-options.type';
import {forgotPassword as forgotPasswordRequest} from './forgot-password.service';
import {handleMutation} from '@/utils/api/handle-mutation.util';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';

export const useForgotPassword = (): {
  forgotPassword: (options: ForgotPasswordHandlerOptions) => Promise<void>;
} => {
  const {useMutation} = useApi();

  const forgotPasswordMutation = useMutation(forgotPasswordRequest as MutationFunction);

  /**
   * Initiates a password reset email.
   */
  const forgotPassword = async ({data, onSuccess, onError}: ForgotPasswordHandlerOptions): Promise<void> => {
    await handleMutation(forgotPasswordMutation, data, onSuccess, onError);
  };

  return {
    forgotPassword,
  };
};
