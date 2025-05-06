import {type LoginTwoFactorFormFields} from '@/app/(auth)/login/components/LoginTwoFactor/types/login-two-factor-form-fields.type';

import {apiRequestHandler} from '@/utils/api/api-request-handler';

export const loginTwoFactorAuth = async (data: LoginTwoFactorFormFields): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login/2fa`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
