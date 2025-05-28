import {type ResetPassword} from '../types/reset-password.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const resetPassword = async (data: ResetPassword): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
