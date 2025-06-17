'use client';

import {type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from 'primereact/button';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {useTranslations} from 'next-intl';
import {type LoginCredentialsFormFields} from './types/login-credentials-form-fields.type.ts';
import {type LoginCredentialsProps} from './types/login-credentials-props.type.ts';
import {loginCredentialsSchema} from './types/login-credentials.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link} from '@/i18n/navigation.ts';

export function LoginCredentials({handleLoginCredentialsSuccess}: LoginCredentialsProps): JSX.Element {
  const {loginCredentials} = useAuthApi();

  const t = useTranslations('Component-Login-Credentials');

  const {
    register: registerCredentials,
    handleSubmit: handleSubmitCredentials,
    setError: setErrorCredentials,
    reset: resetCredentials,
    formState: {errors: errorsCredentials, isSubmitting: isSubmittingCredentials},
  } = useForm<LoginCredentialsFormFields>({resolver: zodResolver(loginCredentialsSchema)});

  const onSubmitCredentials: SubmitHandler<LoginCredentialsFormFields> = async (data) => {
    await loginCredentials({
      params: data,
      onSuccess() {
        resetCredentials();
        handleLoginCredentialsSuccess();
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setErrorCredentials('root', {message: t('error-401-403')});
        } else if (error.response.status === 500) {
          setErrorCredentials('root', {message: t('error-500')});
        } else {
          setErrorCredentials('root', {message: t('error-default')});
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2>{t('title')}</h2>
      <form
        className="mt-6 flex flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
        onSubmit={handleSubmitCredentials(onSubmitCredentials)}
      >
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            {...registerCredentials('email')}
            type="email"
            label={t('email-input-label')}
            data-testid="login-email"
          />
          {errorsCredentials.email ? <p className="text-red-700">{errorsCredentials.email.message}</p> : null}
        </div>
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            {...registerCredentials('password')}
            type="password"
            label={t('password-input-label')}
            data-testid="login-password"
          />
          {errorsCredentials.password ? <p className="text-red-700">{errorsCredentials.password.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmittingCredentials ? t('submit-button-loading-label') : t('submit-button-label')}
            type="submit"
            disabled={isSubmittingCredentials}
            data-testid="login-submit"
          />
        </div>
        {errorsCredentials.root ? <p className="text-red-700">{errorsCredentials.root.message}</p> : null}
      </form>
      <p className="mt-4 md:mt-6 lg:mt-8">
        {t('forgot-password-question')}{' '}
        <Link className="underline" href="/forgot-password" data-testid="login-forgot-password">
          {t('forgot-password-link-label')}
        </Link>
      </p>
      <p className="mt-2 md:mt-4">
        {t('register-question')}{' '}
        <Link className="underline" href="/register">
          {t('register-link-label')}
        </Link>
      </p>
    </div>
  );
}
