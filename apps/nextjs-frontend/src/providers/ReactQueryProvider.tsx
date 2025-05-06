'use client';

import React, {type JSX} from 'react';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

export const ReactQueryProvider = ({children}: {children: React.ReactNode}): JSX.Element => {
  const [queryClient] = React.useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} /> {/* This will only be available if NODE_ENV === 'development' */}
      {children}
    </QueryClientProvider>
  );
};
