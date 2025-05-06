import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type';

export type ConfirmHandlerOptions = BaseAuthHandlerOptions & {
  token: string;
};
