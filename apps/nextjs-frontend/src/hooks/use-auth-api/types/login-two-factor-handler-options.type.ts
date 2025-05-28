import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';
import {type LoginTwoFactorParams} from './login-two-factor-params.type.ts';

export type LoginTwoFactorHandlerOptions = BaseAuthHandlerOptions & LoginTwoFactorParams;
