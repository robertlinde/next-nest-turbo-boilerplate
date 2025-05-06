import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type ForgotPasswordHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    email: string;
  };
};
