import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';
import {type ForgotPasswordParams} from './forgot-password-params.type.ts';

export type ForgotPasswordHandlerOptions = BaseAuthHandlerOptions & ForgotPasswordParams;
