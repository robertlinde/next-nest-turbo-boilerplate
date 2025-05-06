import {type RegisterFormFields} from '../../../app/(auth)/register/types/register-form-fields.type';

import {apiRequestHandler} from '@/utils/api/api-request-handler';

export const register = async (data: RegisterFormFields): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};
