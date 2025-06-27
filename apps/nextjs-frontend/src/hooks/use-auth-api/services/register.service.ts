import {type RegisterParams} from './types/register.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const register = async ({language, createUserData}: RegisterParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language ?? 'en',
    },
    body: JSON.stringify(createUserData),
  });
};
