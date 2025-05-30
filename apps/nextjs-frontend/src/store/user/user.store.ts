import {create} from 'zustand';
import {type User} from './types/user.type';
import {type UserStoreState} from './types/user-store.state.type';
import {type LoadUserReturnType} from './types/load-user.return.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';
import {ApiError} from '@/utils/api/api-error.ts';

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
  async loadUser(): LoadUserReturnType {
    try {
      // eslint-disable-next-line n/prefer-global/process
      const response = await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({user: undefined, loading: false, error: true});
        return {success: false, error: new ApiError('Failed to load user', response)};
      }

      const userResponse: User = (await response.json()) as User;
      set({user: userResponse, loading: false, error: false});
      return {success: true};
    } catch (error) {
      set({user: undefined, loading: false, error: true});
      return {success: false, error: error as ApiError};
    }
  },

  /**
   * Logs the user out by clearing the user state and resetting loading and error flags.
   */
  clearUser(): void {
    set({user: undefined, loading: true, error: false});
  },
}));
