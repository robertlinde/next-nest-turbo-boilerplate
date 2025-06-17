import {createParamDecorator, ExecutionContext, BadRequestException} from '@nestjs/common';
import {Request} from 'express';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const RequiredHeader = createParamDecorator((headerName: string, ctx: ExecutionContext): string | string[] => {
  const request: Request = ctx.switchToHttp().getRequest();
  const headerValue = request.headers[headerName.toLowerCase()];

  if (!headerValue || headerValue === '') {
    throw new BadRequestException(`Missing required header: ${headerName}`);
  }

  return headerValue;
});
