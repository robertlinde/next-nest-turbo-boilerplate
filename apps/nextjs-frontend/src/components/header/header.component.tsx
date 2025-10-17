'use client';

import {useMemo, type JSX} from 'react';
import {Menubar} from 'primereact/menubar';
import {type MenuItem} from 'primereact/menuitem';

export function Header(): JSX.Element {
  const items: MenuItem[] = useMemo(() => [], []);

  return (
    <header>
      <Menubar model={items} />
    </header>
  );
}
