import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';

export type LoginTwoFactorHandlerOptions = BaseAuthHandlerOptions & {
  data: {
    code: string;
  };
};
