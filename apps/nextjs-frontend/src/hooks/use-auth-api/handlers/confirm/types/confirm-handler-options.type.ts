import {type BaseAuthHandlerOptions} from '../../../types/base-auth-handler-options.type.ts';
import {type ConfirmParams} from './confirm-params.type.ts';

export type ConfirmHandlerOptions = BaseAuthHandlerOptions & ConfirmParams;
