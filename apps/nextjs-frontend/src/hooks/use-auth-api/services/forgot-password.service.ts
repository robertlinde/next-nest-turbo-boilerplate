import {type ForgotPasswordParams} from './types/forgot-password.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const forgotPassword = async (data: ForgotPasswordParams): Promise<void> => {
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
