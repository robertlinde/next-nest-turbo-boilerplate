import {type LoginCredentials} from '../types/login-credentials.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const loginCredentials = async (data: LoginCredentials): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/credentials`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
