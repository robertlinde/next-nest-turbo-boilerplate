import {type MutationFunction} from '@tanstack/react-query';
import {register as registerRequest} from './register.service';
import {type RegisterHandlerOptions} from './types/register-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {handleMutation} from '@/utils/api/handle-mutation.util';

export const useRegister = (): {
  register: (options: RegisterHandlerOptions) => Promise<void>;
} => {
  const {useMutation} = useApi();

  const registerMutation = useMutation(registerRequest as MutationFunction);

  /**
   * Registers a new user.
   */
  const register = async ({data, onSuccess, onError}: RegisterHandlerOptions): Promise<void> => {
    await handleMutation(registerMutation, data, onSuccess, onError);
  };

  return {
    register,
  };
};
