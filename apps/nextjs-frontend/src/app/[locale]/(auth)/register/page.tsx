'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useTranslations} from 'next-intl';
import {type RegisterFormFields} from './types/register-form-fields.type.ts';
import {registerSchema} from './types/register.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link} from '@/i18n/navigation.ts';

export default function Register(): JSX.Element {
  const t = useTranslations('Page-Register');

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
      },
      async onError(error: ApiError) {
        switch (error.response.status) {
          case 400: {
            const errorResponse = (await error.response.json()) as {message?: string[]};
            const message: string = errorResponse?.message
              ? errorResponse.message.map((message_) => message_.charAt(0).toUpperCase() + message_.slice(1)).join(', ')
              : t('error-default');
            setError('root', {message});

            break;
          }

          case 409: {
            setError('root', {message: t('error-409')});

            break;
          }

          case 500: {
            setError('root', {message: t('error-500')});

            break;
          }

          default: {
            setError('root', {message: t('error-default')});
          }
        }
      },
    });
  };

  if (didRegisterSuccessfully) {
    return (
      <div className="flex flex-col items-center">
        <h2>{t('success-header')}</h2>
        <p className="mt-4 md:mt-6 lg:mt-8">{t('success-message')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2>{t('title')}</h2>
      <form
        className="mt-6 flex w-full max-w-sm flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label={t('email-input-label')}
            {...register('email')}
            data-testid="register-email-input"
            type="email"
          />
          <small>{t('email-input-info')}</small>
          {errors.email ? <p className="text-red-700">{errors.email.message}</p> : null}
        </div>
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label={t('username-input-label')}
            {...register('username')}
            data-testid="register-username-input"
            type="text"
          />
          <small>{t('username-input-info')}</small>
          {errors.username ? <p className="text-red-700">{errors.username.message}</p> : null}
        </div>
        <div className="flex w-full flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label={t('password-input-label')}
            {...register('password')}
            data-testid="register-password-input"
            type="password"
          />
          {errors.password ? <p className="text-red-700">{errors.password.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
            type="submit"
            data-testid="register-submit-button"
            disabled={isSubmitting}
          />
        </div>
        {errors.root ? <p className="text-red-700">{errors.root.message}</p> : null}
      </form>
      <p className="mt-4 md:mt-6 lg:mt-8">
        {t('login-question')}{' '}
        <Link className="underline" href="/login">
          {t('login-link')}
        </Link>
      </p>
    </div>
  );
}
