import {type RegisterParams} from './types/register.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const register = async (data: RegisterParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
