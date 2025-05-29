import {type ConfirmParams} from './types/confirm.params.type';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const confirm = async ({token}: ConfirmParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/confirm/${token}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
