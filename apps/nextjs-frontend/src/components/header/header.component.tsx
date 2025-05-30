'use client';

import {useRef, type JSX} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Button} from 'primereact/button';
import {Menu} from 'primereact/menu';
import {Menubar} from 'primereact/menubar';
import {type MenuItem} from 'primereact/menuitem';
import {useUserStore} from '@/store/user/user.store';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';

export function Header(): JSX.Element {
  const user = useUserStore((s) => s.user);

  const endMenuRef = useRef<Menu>(null);

  const router = useRouter();

  const {logout} = useAuthApi();

  const items: MenuItem[] = [];

  const endMenuItems: MenuItem[] = [
    {
      label: `Hey, ${user?.username ?? 'User'}`,
      items: [
        {
          label: 'Profile',
          icon: 'pi pi-cog',
          command(): void {
            router.push('/profile');
          },
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: async (): Promise<void> =>
            logout({
              onSuccess() {
                router.push('/login');
              },
            }),
        },
      ],
    },
  ];

  const signedInItem: JSX.Element = (
    <div className="flex gap-2">
      <Menu ref={endMenuRef} popup model={endMenuItems} id="end_menu" />
      <Button
        outlined
        aria-haspopup
        size="small"
        icon="pi pi-user"
        className="rounded-full border-2 border-slate-300 text-2xl"
        aria-controls="end_menu"
        data-testid="header-user-menu-button"
        onClick={(event) => {
          if (endMenuRef?.current) {
            endMenuRef.current.toggle(event);
          }
        }}
      />
    </div>
  );

  const notSignedInItem: JSX.Element = (
    <div className="flex gap-2">
      <Link href="/login">
        <Button outlined label="Login" size="small" data-testid="header-login-button" />
      </Link>
      <Link href="/register">
        <Button label="Register" size="small" />
      </Link>
    </div>
  );

  return (
    <header>
      <Menubar model={items} end={user ? signedInItem : notSignedInItem} />
    </header>
  );
}
