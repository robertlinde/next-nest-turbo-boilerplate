import {type ResetPasswordParams} from './types/reset-password.params.type.ts';
import {apiRequestHandler} from '@/utils/api/api-request-handler.ts';

export const resetPassword = async ({language, resetPasswordData}: ResetPasswordParams): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/reset-password/confirm`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': language ?? 'en',
    },
    body: JSON.stringify(resetPasswordData),
  });
};
