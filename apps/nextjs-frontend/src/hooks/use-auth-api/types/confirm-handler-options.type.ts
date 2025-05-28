import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';

export type ConfirmHandlerOptions = BaseAuthHandlerOptions & {
  token: string;
};
