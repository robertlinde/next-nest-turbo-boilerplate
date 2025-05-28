import {type MutationFunction} from '@tanstack/react-query';
import {loginTwoFactorAuth as loginTwoFactorAuthRequest} from './login-two-factor.service';
import {type LoginTwoFactorHandlerOptions} from './types/login-two-factor-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {handleMutation} from '@/utils/api/handle-mutation.util';
import {useUserStore} from '@/store/user.store';

export const useLoginTwoFactor = (): {
  loginTwoFactor: (options: LoginTwoFactorHandlerOptions) => Promise<void>;
} => {
  const {useMutation} = useApi();
  const loadUser = useUserStore((state) => state.loadUser);

  const loginTwoFactorMutation = useMutation(loginTwoFactorAuthRequest as MutationFunction);

  /**
   * Authenticates a user using two-factor authentication.
   */
  const loginTwoFactor = async ({data, onSuccess, onError}: LoginTwoFactorHandlerOptions): Promise<void> => {
    await handleMutation(
      loginTwoFactorMutation,
      data,
      async () => {
        await loadUser();
        await onSuccess?.();
      },
      onError,
    );
  };

  return {
    loginTwoFactor,
  };
};
