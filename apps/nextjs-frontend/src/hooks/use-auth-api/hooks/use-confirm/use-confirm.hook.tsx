import {type MutationFunction} from '@tanstack/react-query';
import {type ConfirmHandlerOptions} from './types/confirm-handler-options.type';
import {confirm as confirmRequest} from './confirm.service';
import {useApi} from '@/hooks/use-api/use-api.hook.tsx';

export const useConfirm = (): {
  confirm: (options: ConfirmHandlerOptions) => Promise<void>;
} => {
  const {useMutation, handleMutation} = useApi();

  const confirmMutation = useMutation(confirmRequest as MutationFunction);

  /**
   * Confirms a user's email using a token.
   */
  const confirmHandler = async ({onSuccess, onError, token}: ConfirmHandlerOptions): Promise<void> => {
    if (!token) throw new Error('Missing token');
    await handleMutation(confirmMutation, token, onSuccess, onError);
  };

  return {
    confirm: confirmHandler,
  };
};
