'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useSearchParams} from 'next/navigation';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type ResetPasswordFormFields} from './types/reset-password-form-fields.type.ts';
import {resetPasswordSchema} from './types/reset-password.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link} from '@/i18n/navigation.ts';

export default function ResetPassword(): JSX.Element {
  const t = useTranslations('Page-Reset-Password');

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

  const locale = useLocale();

  const onSubmit: SubmitHandler<ResetPasswordFormFields> = async (data) => {
    const token = searchParameters.get('token');

    if (!token) {
      setError('root', {message: t('error-no-token')});
      return;
    }

    await resetPassword({
      params: {
        resetPasswordData: {
          token,
          password: data.password,
        },
        language: locale,
      },
      onSuccess() {
        reset();
        setDidResetPasswordSuccessfully(true);
      },
      onError(error: ApiError) {
        switch (error.response.status) {
          case 410: {
            setError('root', {message: t('error-410')});

            break;
          }

          case 404: {
            setError('root', {message: t('error-404')});

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

  if (didResetPasswordSuccessfully) {
    return (
      <div className="flex flex-col items-center">
        <h2>{t('success-header')}</h2>
        <p className="mt-4 md:mt-6 lg:mt-8">{t('success-message')}</p>
        <Link className="underline" href="/login">
          {t('success-login-link')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h2>{t('title')}</h2>
      <form
        className="mt-6 flex flex-col items-center gap-4 md:mt-10 md:gap-6 lg:mt-12 lg:gap-8"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col flex-wrap items-center gap-1">
          <FloatLabelInputText
            label={t('password-input-label')}
            {...register('password')}
            type="password"
            data-testid="reset-password-password-input"
          />
          {errors.password ? <p className="text-red-700">{errors.password.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
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
