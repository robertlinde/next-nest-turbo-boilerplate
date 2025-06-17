'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {type ForgotPasswordFormFields} from './types/forgot-password-form-fields.type.ts';
import {forgotPasswordSchema} from './types/forgot-password.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {useToast} from '@/hooks/use-toast/use-toast.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';

export default function ForgotPassword(): JSX.Element {
  const {showToast} = useToast();

  const [didSendPasswordReset, setDidSendPasswordReset] = useState(false);

  const {forgotPassword} = useAuthApi();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<ForgotPasswordFormFields>({resolver: zodResolver(forgotPasswordSchema)});

  const onSubmit: SubmitHandler<ForgotPasswordFormFields> = async (data) => {
    await forgotPassword({
      params: data,
      onSuccess() {
        reset();
        setDidSendPasswordReset(true);
        showToast({
          severity: 'success',
          summary: 'Password reset successful',
        });
      },
      onError(error: ApiError) {
        if (error.response.status === 401) {
          setError('root', {message: 'Invalid email or password'});
        } else if (error.response.status === 500) {
          setError('root', {message: 'Something went wrong'});
        } else {
          setError('root', {message: 'An unknown error occurred'});
        }
      },
    });
  };

  if (didSendPasswordReset) {
    return (
      <div className="flex flex-col items-center">
        <h2>Check your email</h2>
        <p className="text-center">
          If the email is registered, we have sent you an email with instructions to reset your password.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2>Reset your password</h2>
      <form
        className="mt-6 flex flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label="Email"
            {...register('email')}
            type="email"
            data-testid="forgot-password-email-input"
          />
          {errors.email ? <p className="text-red-700">{errors.email.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? 'Loading ...' : 'Reset password'}
            type="submit"
            disabled={isSubmitting}
            data-testid="forgot-password-submit-button"
          />
        </div>
        {errors.root ? <p className="text-red-700">{errors.root.message}</p> : null}
      </form>
    </div>
  );
}
