import {type ForgotPassword} from '../types/forgot-password.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const forgotPassword = async (data: ForgotPassword): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/request`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
