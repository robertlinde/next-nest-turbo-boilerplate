import {type MutationFunction} from '@tanstack/react-query';
import {loginCredentials as loginCredentialsRequest} from './login-credentials.service';
import {type LoginCredentialsHandlerOptions} from './types/login-credentials-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {handleMutation} from '@/utils/api/handle-mutation.util';

export const useLoginCredentials = (): {
  loginCredentials: (options: LoginCredentialsHandlerOptions) => Promise<void>;
} => {
  const {useMutation} = useApi();

  const loginCredentialsMutation = useMutation(loginCredentialsRequest as MutationFunction);

  /**
   * Authenticates a user using credentials.
   */
  const loginCredentials = async ({data, onSuccess, onError}: LoginCredentialsHandlerOptions): Promise<void> => {
    await handleMutation(
      loginCredentialsMutation,
      data,
      async () => {
        await onSuccess?.();
      },
      onError,
    );
  };

  return {
    loginCredentials,
  };
};
