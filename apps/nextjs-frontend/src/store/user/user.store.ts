import {create} from 'zustand';
import {type User} from './types/user.type';
import {type UserStoreState} from './types/user-store.state.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

/**
 * Zustand store to manage user authentication state.
 *
 * Provides `user`, `loading`, and `error` state, along with methods to
 * `loadUser` from the backend and `logout` the current user.
 */
export const useUserStore = create<UserStoreState>((set) => ({
  user: undefined,
  loading: true,
  error: false,

  /**
   * Loads the current user from the backend API.
   * Sets `user`, `loading`, and `error` states based on the response.
   */
  async loadUser(): Promise<void> {
    try {
      // eslint-disable-next-line n/prefer-global/process
      const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({user: undefined, loading: false, error: true});
        return;
      }

      const userResponse: User = (await response.json()) as User;
      set({user: userResponse, loading: false, error: false});
    } catch {
      set({user: undefined, loading: false, error: true});
    }
  },

  /**
   * Logs the user out by clearing the user state and resetting loading and error flags.
   */
  clearUser(): void {
    set({user: undefined, loading: true, error: false});
  },
}));
