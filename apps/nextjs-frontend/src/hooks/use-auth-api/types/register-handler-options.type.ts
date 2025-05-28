import {type BaseAuthHandlerOptions} from './base-auth-handler-options.type.ts';
import {type RegisterParams} from './register-params.type.ts';

export type RegisterHandlerOptions = BaseAuthHandlerOptions & RegisterParams;
