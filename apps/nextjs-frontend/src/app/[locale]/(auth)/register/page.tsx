'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import Link from 'next/link';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {type RegisterFormFields} from './types/register-form-fields.type.ts';
import {registerSchema} from './types/register.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {useToast} from '@/hooks/use-toast/use-toast.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';

export default function Register(): JSX.Element {
  const {showToast} = useToast();

  const [didRegisterSuccessfully, setDidRegisterSuccessfully] = useState(false);

  const {register: registerFunction} = useAuthApi();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<RegisterFormFields>({resolver: zodResolver(registerSchema)});

  const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
    await registerFunction({
      params: data,
      onSuccess() {
        reset();
        setDidRegisterSuccessfully(true);
        showToast({
          severity: 'success',
          summary: 'Registration successful',
          detail: 'You have registered. We will send you a confirmation email.',
        });
      },
      async onError(error: ApiError) {
        switch (error.response.status) {
          case 400: {
            const errorResponse = (await error.response.json()) as {message?: string[]};
            const message: string = errorResponse?.message
              ? errorResponse.message.map((message_) => message_.charAt(0).toUpperCase() + message_.slice(1)).join(', ')
              : 'An unexpected error occurred.';
            setError('root', {message});

            break;
          }

          case 409: {
            setError('root', {message: 'Email or username already exists'});

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

  if (didRegisterSuccessfully) {
    return (
      <div className="flex flex-col items-center">
        <h2>Registration successful!</h2>
        <p className="mt-4 md:mt-6 lg:mt-8">We have sent you a confirmation email. Please check your inbox.</p>
        <Link className="underline" href="/login">
          Login here
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2>Welcome!</h2>
      <form
        className="mt-6 flex w-full max-w-sm flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText label="Email" {...register('email')} data-testid="register-email-input" type="email" />
          <small>Your email won&apos;t be publicly visible.</small>
          {errors.email ? <p className="text-red-700">{errors.email.message}</p> : null}
        </div>
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label="Username"
            {...register('username')}
            data-testid="register-username-input"
            type="text"
          />
          <small>Your username will be publicly visible. It can be changed later.</small>
          {errors.username ? <p className="text-red-700">{errors.username.message}</p> : null}
        </div>
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label="Password"
            {...register('password')}
            data-testid="register-password-input"
            type="password"
          />
          {errors.password ? <p className="text-red-700">{errors.password.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? 'Loading ...' : 'Register'}
            type="submit"
            data-testid="register-submit-button"
            disabled={isSubmitting}
          />
        </div>
        {errors.root ? <p className="text-red-700">{errors.root.message}</p> : null}
      </form>
      <p className="mt-4 md:mt-6 lg:mt-8">
        Already registered?{' '}
        <Link className="underline" href="/login">
          Login here
        </Link>
      </p>
    </div>
  );
}
