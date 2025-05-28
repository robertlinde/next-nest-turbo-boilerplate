import {type BaseAuthHandlerOptions} from '../../../types/base-auth-handler-options.type.ts';
import {type LoginCredentialsParams} from './login-credentials-params.type.ts';

export type LoginCredentialsHandlerOptions = BaseAuthHandlerOptions & LoginCredentialsParams;
