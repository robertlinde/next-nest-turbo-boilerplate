import {type ConfirmParams} from './types/confirm-params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util.ts';

export const confirm = async (params: ConfirmParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/confirm/${params.token}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
