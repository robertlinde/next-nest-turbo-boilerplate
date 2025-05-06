import {type ForgotPasswordFormFields} from '../../../app/(auth)/forgot-password/types/forgot-password-form-fields.type';

import {apiRequestHandler} from '@/utils/api/api-request-handler';

export const forgotPassword = async (data: ForgotPasswordFormFields): Promise<void> => {
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
