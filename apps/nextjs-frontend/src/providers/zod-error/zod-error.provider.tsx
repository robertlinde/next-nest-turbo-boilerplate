'use client';

import {useEffect} from 'react';
import {useTranslations, useLocale} from 'next-intl';
import {z} from 'zod';
import {createZodErrorMap} from './utils/create-zod-error-map-util.ts';

interface ZodErrorProviderProps {
  children: React.ReactNode;
}

export function ZodErrorProvider({children}: ZodErrorProviderProps) {
  const t = useTranslations('validation');
  const locale = useLocale();

  useEffect(() => {
    // Set the global Zod error map
    const errorMap = createZodErrorMap(t);
    z.setErrorMap(errorMap);
  }, [t, locale]);

  return <>{children}</>;
}
