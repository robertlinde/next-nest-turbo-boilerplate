import {type User} from './user.type';

/**
 * Zustand store state for managing the authenticated user's state.
 */
export type UserStoreState = {
  user: User | undefined;
  loading: boolean;
  error: boolean;
  loadUser: () => Promise<void>;
  clearUser: () => void;
};
