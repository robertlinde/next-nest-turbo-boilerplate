'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type ForgotPasswordFormFields} from './types/forgot-password-form-fields.type.ts';
import {forgotPasswordSchema} from './types/forgot-password.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';

export default function ForgotPassword(): JSX.Element {
  const t = useTranslations('Page-Forgot-Password');

  const [didSendPasswordReset, setDidSendPasswordReset] = useState(false);

  const {forgotPassword} = useAuthApi();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<ForgotPasswordFormFields>({resolver: zodResolver(forgotPasswordSchema)});

  const locale = useLocale();

  const onSubmit: SubmitHandler<ForgotPasswordFormFields> = async (data) => {
    await forgotPassword({
      params: {...data, language: locale},
      onSuccess() {
        reset();
        setDidSendPasswordReset(true);
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('root', {message: t('error-401-403')});
        } else if (error.response.status === 500) {
          setError('root', {message: t('error-500')});
        } else {
          setError('root', {message: t('error-default')});
        }
      },
    });
  };

  if (didSendPasswordReset) {
    return (
      <div className="flex flex-col items-center">
        <h2>{t('success-header')}</h2>
        <p className="text-center">{t('success-message')}</p>
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
            label={t('email-input-label')}
            {...register('email')}
            type="email"
            data-testid="forgot-password-email-input"
          />
          {errors.email ? <p className="text-red-700">{errors.email.message}</p> : null}
        </div>
        <div>
          <Button
            label={isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
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
