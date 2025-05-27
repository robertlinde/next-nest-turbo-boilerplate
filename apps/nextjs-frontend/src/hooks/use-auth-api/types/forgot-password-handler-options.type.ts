import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';

export type ForgotPasswordHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    email: string;
  };
};
