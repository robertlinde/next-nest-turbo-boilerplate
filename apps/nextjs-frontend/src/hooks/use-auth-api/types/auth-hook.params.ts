import {type BaseAuth} from './base-auth.type.ts';

export type AuthHookParams<T = unknown> = BaseAuth & {params?: T};
