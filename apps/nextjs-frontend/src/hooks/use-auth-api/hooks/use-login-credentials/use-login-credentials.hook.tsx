import {type LoginCredentialsHandlerOptions} from './types/login-credentials-handler-options.type';
import {type LoginCredentialsParams} from './types/login-credentials-params.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util';

export const useLoginCredentials = (): {
  loginCredentials: (options: LoginCredentialsHandlerOptions) => Promise<void>;
} => {
  const loginCredentialsRequest = async (data: LoginCredentialsParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/credentials`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

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
