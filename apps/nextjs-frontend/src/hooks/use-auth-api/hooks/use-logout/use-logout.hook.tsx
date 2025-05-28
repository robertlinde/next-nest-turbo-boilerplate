import {logout as logoutRequest} from './logout.service';
import {type LogoutHandlerOptions} from './types/logout-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {useUserStore} from '@/store/user.store.ts';

export const useLogout = (): {
  logout: (options?: LogoutHandlerOptions) => Promise<void>;
} => {
  const {sendRequest} = useApi(logoutRequest);
  const logoutAuth = useUserStore((state) => state.logout);

  /**
   * Logs the user out and clears local auth state.
   */
  const logout = async ({onSuccess, onError}: LogoutHandlerOptions = {}): Promise<void> => {
    logoutAuth();
    await sendRequest(undefined, onSuccess, onError);
  };

  return {
    logout,
  };
};
