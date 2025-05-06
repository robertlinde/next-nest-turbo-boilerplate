import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type LoginTwoFactorHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    code: string;
  };
};
