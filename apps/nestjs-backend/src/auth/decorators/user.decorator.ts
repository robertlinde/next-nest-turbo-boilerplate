import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {ActiveUserData} from '../types/active-user-data.type';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const User = createParamDecorator((data: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{user: ActiveUserData}>();
  const {user} = request;

  return data ? user?.[data] : user;
});
