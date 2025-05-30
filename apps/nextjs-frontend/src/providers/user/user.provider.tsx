'use client';

import {useEffect, type JSX} from 'react';
import {useUserStore} from '@/store/user/user.store';

export function UserProvider({children}: {readonly children: JSX.Element}): JSX.Element {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return children;
}
