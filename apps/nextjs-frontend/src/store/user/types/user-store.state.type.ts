import {type UserDto} from '@next-nest-turbo-auth-boilerplate/shared';
import {type LoadUserReturnType} from './load-user.return.type';

/**
 * Zustand store state for managing the authenticated user's state.
 */
export type UserStoreState = {
  user: UserDto | undefined;
  loading: boolean;
  error: boolean;
  loadUser: () => LoadUserReturnType;
  clearUser: () => void;
};
