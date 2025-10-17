'use client';

import {useMemo, type JSX} from 'react';
import {Menubar} from 'primereact/menubar';
import {type MenuItem} from 'primereact/menuitem';
import {useTranslations} from 'next-intl';

export function Header(): JSX.Element {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const t = useTranslations('Component-Header');

  const items: MenuItem[] = useMemo(() => [], []);

  return (
    <header>
      <Menubar model={items} />
    </header>
  );
}
