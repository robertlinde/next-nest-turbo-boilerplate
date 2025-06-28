import {type LoginCredentialsParams} from './types/login-credentials.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const loginCredentials = async ({language, loginCredentialsData}: LoginCredentialsParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/credentials`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language ?? 'en',
    },
    body: JSON.stringify(loginCredentialsData),
  });
};
