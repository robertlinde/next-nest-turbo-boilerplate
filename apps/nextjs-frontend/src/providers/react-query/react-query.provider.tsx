'use client';

import React, {useMemo, type JSX} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

export function ReactQueryProvider({children}: {readonly children: React.ReactNode}): JSX.Element {
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} /> {/* This will only be available if NODE_ENV === 'development' */}
      {children}
    </QueryClientProvider>
  );
}
