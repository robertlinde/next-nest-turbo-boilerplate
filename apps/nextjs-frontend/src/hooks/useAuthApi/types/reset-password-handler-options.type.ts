import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type ResetPasswordHandlerOptions = BaseAuthHandlerOptions & {
  token: string;
  data: {
    password: string;
  };
};
