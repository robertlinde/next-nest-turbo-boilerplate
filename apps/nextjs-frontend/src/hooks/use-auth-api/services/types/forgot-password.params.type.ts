import {type ResetPasswordRequestBody} from '@next-nest-turbo-auth-boilerplate/shared';

export type ForgotPasswordParams = {
  language: string;
  forgotPasswordData: ResetPasswordRequestBody;
};
