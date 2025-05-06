import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type RegisterHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    email: string;
    username: string;
    password: string;
  };
};
