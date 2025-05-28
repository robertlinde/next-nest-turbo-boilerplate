import {loginCredentials as loginCredentialsRequest} from './login-credentials.service';
import {type LoginCredentialsHandlerOptions} from './types/login-credentials-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';

export const useLoginCredentials = (): {
  loginCredentials: (options: LoginCredentialsHandlerOptions) => Promise<void>;
} => {
  const {sendRequest} = useApi(loginCredentialsRequest);

  /**
   * Authenticates a user using credentials.
   */
  const loginCredentials = async ({data, onSuccess, onError}: LoginCredentialsHandlerOptions): Promise<void> => {
    await sendRequest(
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
