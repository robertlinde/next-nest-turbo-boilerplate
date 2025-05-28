import {register as registerRequest} from './register.service';
import {type RegisterHandlerOptions} from './types/register-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';

export const useRegister = (): {
  register: (options: RegisterHandlerOptions) => Promise<void>;
} => {
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
