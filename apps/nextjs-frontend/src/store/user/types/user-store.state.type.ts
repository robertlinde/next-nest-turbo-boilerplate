import {type User} from './user.type';
import {type LoadUserReturnType} from './load-user.return.type';

/**
 * Zustand store state for managing the authenticated user's state.
 */
export type UserStoreState = {
  user: User | undefined;
  loading: boolean;
  error: boolean;
  loadUser: () => LoadUserReturnType;
  clearUser: () => void;
};
