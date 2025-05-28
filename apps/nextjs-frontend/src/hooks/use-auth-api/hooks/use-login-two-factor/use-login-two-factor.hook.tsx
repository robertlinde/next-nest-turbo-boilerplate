import {type LoginTwoFactorHandlerOptions} from './types/login-two-factor-handler-options.type';
import {type LoginTwoFactorParams} from './types/login-two-factor-params.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {useUserStore} from '@/store/user.store';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util';

export const useLoginTwoFactor = (): {
  loginTwoFactor: (options: LoginTwoFactorHandlerOptions) => Promise<void>;
} => {
  const loginTwoFactorAuthRequest = async (data: LoginTwoFactorParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/2fa`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  };

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
