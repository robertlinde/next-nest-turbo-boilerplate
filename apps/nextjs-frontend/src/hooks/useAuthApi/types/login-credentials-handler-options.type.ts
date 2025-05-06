import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type LoginCredentialsHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    email: string;
    password: string;
  };
};
