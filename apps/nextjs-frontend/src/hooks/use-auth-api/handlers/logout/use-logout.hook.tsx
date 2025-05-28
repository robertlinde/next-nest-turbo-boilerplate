import {logout as logoutRequest} from './logout.service';
import {type LogoutHandlerOptions} from './types/logout-handler-options.type';
import {useApi} from '@/hooks/use-api/use-api.hook';
import {useUserStore} from '@/store/user.store.ts';
import {handleMutation} from '@/utils/api/handle-mutation.util';

export const useLogout = (): {
  logout: (options?: LogoutHandlerOptions) => Promise<void>;
} => {
  const {useMutation} = useApi();
  const logoutAuth = useUserStore((state) => state.logout);

  const logoutMutation = useMutation(logoutRequest);

  /**
   * Logs the user out and clears local auth state.
   */
  const logout = async ({onSuccess, onError}: LogoutHandlerOptions = {}): Promise<void> => {
    logoutAuth();
    await handleMutation(logoutMutation, undefined, onSuccess, onError);
  };

  return {
    logout,
  };
};
