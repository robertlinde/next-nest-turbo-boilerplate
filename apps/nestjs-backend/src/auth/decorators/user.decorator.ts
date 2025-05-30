import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {ActiveUser} from '../types/active-user.type';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const User = createParamDecorator((data: keyof ActiveUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{user: ActiveUser}>();
  const {user} = request;

  return data ? user?.[data] : user;
});
