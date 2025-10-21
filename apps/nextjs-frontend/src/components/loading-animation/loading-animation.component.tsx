'use client';

import {type JSX} from 'react';
import {ProgressSpinner} from 'primereact/progressspinner';
import {useLoadingStore} from '@/store/loading/loading.store';

export function LoadingAnimation(): JSX.Element | undefined {
  const {isLoading} = useLoadingStore();

  if (!isLoading) {
    return undefined;
  }

  return (
    <div className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-gray-800/10">
      <ProgressSpinner />
    </div>
  );
}
