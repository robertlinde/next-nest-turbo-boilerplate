import {type ResetPasswordFormFields} from '../../../app/(auth)/reset-password/types/reset-password-form-fields.type';

import {apiRequestHandler} from '@/utils/api/api-request-handler';

export const resetPassword = async (data: ResetPasswordFormFields & {token: string}): Promise<void> => {
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
