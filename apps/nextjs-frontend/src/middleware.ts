import createMiddleware from 'next-intl/middleware';
import {type MiddlewareConfig} from 'next/server';
import {routing} from './i18n/routing.ts';

export default createMiddleware(routing);

export const config: MiddlewareConfig = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // eslint-disable-next-line unicorn/prefer-string-raw
    '/((?!api|trpc|_next|_vercel)(?!.*\\..*).*)',
  ],
};
