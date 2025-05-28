import {type ForgotPasswordParams} from './forgot-password-params.type';
import {type BaseAuthHandlerOptions} from '@/hooks/use-auth-api/types/base-auth-handler-options.type';

export type ForgotPasswordHandlerOptions = BaseAuthHandlerOptions & ForgotPasswordParams;
