'use client';

import {type JSX, useEffect, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';

export default function Confirm(): JSX.Element {
  const searchParameters = useSearchParams();

  const [confirmStatus, setConfirmStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const {confirm} = useAuthApi();

  useEffect(() => {
    const token = searchParameters.get('token');

    if (token) {
      void confirm({
        params: {token},
        onSuccess() {
          setConfirmStatus('success');
        },
        onError(error: ApiError) {
          if (error.response.status === 404) {
            setConfirmStatus('error');
          } else if (error.response.status === 500) {
            setConfirmStatus('error');
          } else {
            setConfirmStatus('error');
          }
        },
      });
    }
  }, [searchParameters]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {confirmStatus === 'pending' && <p>Confirming...</p>}
      {confirmStatus === 'success' && <p>Confirmation successful! You can now log in.</p>}
      {confirmStatus === 'error' && <p>Confirmation failed. Please try again.</p>}
    </div>
  );
}
