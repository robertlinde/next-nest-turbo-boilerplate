import {type BaseAuthHandlerOptions} from '../../../types/base-auth-handler-options.type.ts';
import {type ResetPasswordParams} from './reset-password-params.type.ts';

export type ResetPasswordHandlerOptions = BaseAuthHandlerOptions & ResetPasswordParams;
