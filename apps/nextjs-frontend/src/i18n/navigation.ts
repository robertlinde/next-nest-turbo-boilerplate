import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing.ts';

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
// eslint-disable-next-line @typescript-eslint/naming-convention
export const {Link, redirect, usePathname, useRouter, getPathname} = createNavigation(routing);
