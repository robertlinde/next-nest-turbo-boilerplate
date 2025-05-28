import {type RegisterHandlerOptions} from './types/register-handler-options.type';
import {type RegisterParams} from './types/register-params.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util';

export const useRegister = (): {
  register: (options: RegisterHandlerOptions) => Promise<void>;
} => {
  const registerRequest = async (data: RegisterParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

  const {sendRequest} = useApi(registerRequest);

  /**
   * Registers a new user.
   */
  const register = async ({data, onSuccess, onError}: RegisterHandlerOptions): Promise<void> => {
    await sendRequest(data, onSuccess, onError);
  };

  return {
    register,
  };
};
