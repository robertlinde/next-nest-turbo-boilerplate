import {type ConfirmHandlerOptions} from './types/confirm-handler-options.type';
import {type ConfirmParams} from './types/confirm-params.type';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';
import {apiRequestHandler} from '@/utils/api/api-request-handler.util';

export const useConfirm = (): {
  confirm: (options: ConfirmHandlerOptions) => Promise<void>;
} => {
  const confirmRequest = async (params: ConfirmParams): Promise<void> => {
    // eslint-disable-next-line n/prefer-global/process
    await apiRequestHandler(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/confirm/${params.token}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const {sendRequest} = useApi(confirmRequest);

  /**
   * Confirms a user's email using a token.
   */
  const confirmHandler = async ({onSuccess, onError, token}: ConfirmHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await sendRequest(token, onSuccess, onError);
  };

  return {
    confirm: confirmHandler,
  };
};
