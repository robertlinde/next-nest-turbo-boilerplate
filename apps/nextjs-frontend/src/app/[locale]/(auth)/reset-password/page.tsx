'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {type ResetPasswordFormFields} from './types/reset-password-form-fields.type.ts';
import {resetPasswordSchema} from './types/reset-password.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {useToast} from '@/hooks/use-toast/use-toast.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';

export default function ResetPassword(): JSX.Element {
  const {showToast} = useToast();

  const [didResetPasswordSuccessfully, setDidResetPasswordSuccessfully] = useState(false);

  const searchParameters = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<ResetPasswordFormFields>({resolver: zodResolver(resetPasswordSchema)});

  const {resetPassword} = useAuthApi();

  const onSubmit: SubmitHandler<ResetPasswordFormFields> = async (data) => {
    const token = searchParameters.get('token');

    if (!token) {
      setError('root', {message: 'Token is required'});
      return;
    }

    await resetPassword({
      params: {...data, token},
      onSuccess() {
        reset();
        setDidResetPasswordSuccessfully(true);
        showToast({
          severity: 'success',
          summary: 'Password reset successful',
        });
      },
      onError(error: ApiError) {
        switch (error.response.status) {
          case 410: {
            setError('root', {message: 'Token expired. Please request the password reset again'});

            break;
          }

          case 404: {
            setError('root', {message: 'Token not found. Please request the password reset again'});

            break;
          }

          case 500: {
            setError('root', {message: 'Something went wrong'});

            break;
          }

          default: {
            setError('root', {message: 'An unknown error occurred'});
          }
        }
      },
    });
  };

  if (didResetPasswordSuccessfully) {
    return (
      <div className="flex flex-col items-center">
        <h2>Password reset successful!</h2>
        <p className="mt-4 md:mt-6 lg:mt-8">You can now log in with your new password.</p>
        <Link className="underline" href="/login">
          Login here
        </Link>
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
            label="Password"
            {...register('password')}
            type="password"
            data-testid="reset-password-password-input"
          />
          {errors.password ? <p className="text-red-700">{errors.password.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? 'Loading ...' : 'Reset password'}
            type="submit"
            disabled={isSubmitting}
            data-testid="reset-password-submit-button"
          />
        </div>
        {errors.root ? <p className="text-red-700">{errors.root.message}</p> : null}
      </form>
    </div>
  );
}
