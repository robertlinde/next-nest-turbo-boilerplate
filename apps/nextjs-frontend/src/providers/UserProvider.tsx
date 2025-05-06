'use client';

import {useEffect, type JSX} from 'react';

import {useUserStore} from '@/store/user.store';

export const UserProvider = ({children}: {children: JSX.Element}): JSX.Element => {
  const loadUser = useUserStore((s) => s.loadUser);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return <>{children}</>;
};
