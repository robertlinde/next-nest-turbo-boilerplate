'use client';

import {type JSX} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import Link from 'next/link';
import {Button} from 'primereact/button';
import {useForm, type SubmitHandler} from 'react-hook-form';

import {type LoginCredentialsFormFields} from './types/login-credentials-form-fields.type';
import {type LoginCredentialsProps} from './types/login-credentials-props.type';
import {loginCredentialsSchema} from './types/login-credentials.schema';

import {FloatLabelInputText} from '@/components/FloatLabelInputText/FloatLabelInputText.component';

import {useAuthApi} from '@/hooks/useAuthApi/useAuthApi';
import {type ApiError} from '@/utils/api/api-error';

export const LoginCredentials = ({handleLoginCredentialsSuccess}: LoginCredentialsProps): JSX.Element => {
  const {loginCredentials} = useAuthApi();

  const {
    register: registerCredentials,
    handleSubmit: handleSubmitCredentials,
    setError: setErrorCredentials,
    reset: resetCredentials,
    formState: {errors: errorsCredentials, isSubmitting: isSubmittingCredentials},
  } = useForm<LoginCredentialsFormFields>({resolver: zodResolver(loginCredentialsSchema)});

  const onSubmitCredentials: SubmitHandler<LoginCredentialsFormFields> = async (data) => {
    await loginCredentials({
      data,
      onSuccess() {
        resetCredentials();
        handleLoginCredentialsSuccess();
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setErrorCredentials('root', {message: 'Invalid email or password'});
        } else if (error.response.status === 500) {
          setErrorCredentials('root', {message: 'Something went wrong'});
        } else {
          setErrorCredentials('root', {message: 'An unknown error occurred'});
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2>Welcome back!</h2>
      <form
        onSubmit={handleSubmitCredentials(onSubmitCredentials)}
        className="mt-6 flex flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
      >
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText {...registerCredentials('email')} type="email" label="Email" data-testid="login-email" />
          {errorsCredentials.email && <p className="text-red-700">{errorsCredentials.email.message}</p>}
        </div>
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            {...registerCredentials('password')}
            type="password"
            label="Password"
            data-testid="login-password"
          />
          {errorsCredentials.password && <p className="text-red-700">{errorsCredentials.password.message}</p>}
        </div>
        <div>
          <Button
            label={isSubmittingCredentials ? 'Loading ...' : 'Login'}
            type="submit"
            disabled={isSubmittingCredentials}
            data-testid="login-submit"
          />
        </div>
        {errorsCredentials.root && <p className="text-red-700">{errorsCredentials.root.message}</p>}
      </form>
      <p className="mt-4 md:mt-6 lg:mt-8">
        Forgot your password?{' '}
        <Link className="underline" href="/forgot-password" data-testid="login-forgot-password">
          Reset it here
        </Link>
      </p>
      <p className="mt-2 md:mt-4">
        Not registered yet?{' '}
        <Link className="underline" href="/register">
          Register here
        </Link>
      </p>
    </div>
  );
};
