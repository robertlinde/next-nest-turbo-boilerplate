import {create} from 'zustand';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

/**
 * Represents a user object.
 * @typedef {Object} User
 * @property {string} id - The user's unique identifier.
 * @property {string} email - The user's email address.
 * @property {string} username - The user's username.
 */
type User = {
  id: string;
  email: string;
  username: string;
};

/**
 * Zustand store state for managing the authenticated user's state.
 * @typedef {Object} UserStoreState
 * @property {User | undefined} user - The current user object or undefined if not loaded.
 * @property {boolean} loading - Indicates whether the user is being loaded.
 * @property {boolean} error - Indicates whether there was an error loading the user.
 * @property {() => Promise<void>} loadUser - Function to fetch and set the current user.
 * @property {() => void} logout - Function to clear the current user and reset state.
 */
type UserStoreState = {
  user: User | undefined;
  loading: boolean;
  error: boolean;
  loadUser: () => Promise<void>;
  logout: () => void;
};

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
   *
   * @returns {Promise<void>} A promise that resolves once the user is loaded.
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
  logout(): void {
    set({user: undefined, loading: true, error: false});
  },
}));
