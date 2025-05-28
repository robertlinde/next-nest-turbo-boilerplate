import {Injectable, ExecutionContext} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '@nestjs/passport';
import {Observable} from 'rxjs';
import {IS_PUBLIC_KEY} from './decorators/public.decorator';

/**
 * JwtAuthGuard to protect routes with JWT authentication.
 * Skips authentication if the @Public decorator is present on the route.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Override the default `canActivate` method to check for the @Public decorator.
   * If the route has @Public, the JWT validation is skipped.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context); // Otherwise, proceed with the JWT validation
  }
}
