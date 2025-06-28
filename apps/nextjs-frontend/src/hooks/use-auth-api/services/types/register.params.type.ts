import {type CreateUserBody} from '@next-nest-turbo-auth-boilerplate/shared';

export type RegisterParams = {
  createUserData: CreateUserBody;
  language: string;
};
