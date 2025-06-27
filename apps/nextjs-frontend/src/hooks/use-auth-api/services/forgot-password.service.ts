import {type ForgotPasswordParams} from './types/forgot-password.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const forgotPassword = async ({forgotPasswordData, language}: ForgotPasswordParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/request`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language ?? 'en',
    },
    body: JSON.stringify(forgotPasswordData),
  });
};
