import {loginTwoFactorAuth as loginTwoFactorAuthRequest} from './login-two-factor.service';
import {type LoginTwoFactorHandlerOptions} from './types/login-two-factor-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {useUserStore} from '@/store/user.store';

export const useLoginTwoFactor = (): {
  loginTwoFactor: (options: LoginTwoFactorHandlerOptions) => Promise<void>;
} => {
  const {sendRequest} = useApi(loginTwoFactorAuthRequest);
  const loadUser = useUserStore((state) => state.loadUser);

  /**
   * Authenticates a user using two-factor authentication.
   */
  const loginTwoFactor = async ({data, onSuccess, onError}: LoginTwoFactorHandlerOptions): Promise<void> => {
    await sendRequest(
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
