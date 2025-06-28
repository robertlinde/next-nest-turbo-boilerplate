'use client';

import {type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from 'primereact/button';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {useTranslations} from 'next-intl';
import {type LoginTwoFactorFormFields} from './types/login-two-factor-form-fields.type.ts';
import {loginTwoFactorSchema} from './types/login-two-factor.schema.ts';
import {FloatLabelInputText} from '@/components/float-label-input-text/float-label-input-text.component.tsx';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {useToast} from '@/hooks/use-toast/use-toast.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {useRouter} from '@/i18n/navigation.ts';

export function LoginTwoFactor(): JSX.Element {
  const {showToast} = useToast();

  const t = useTranslations('Component-Login-2FA');

  const router = useRouter();
  const {loginTwoFactor} = useAuthApi();
  const {
    register: register2fa,
    handleSubmit: handleSubmit2fa,
    setError: setError2fa,
    reset: reset2fa,
    formState: {errors: errors2fa, isSubmitting: isSubmitting2fa},
  } = useForm<LoginTwoFactorFormFields>({resolver: zodResolver(loginTwoFactorSchema)});

  const onSubmit2fa: SubmitHandler<LoginTwoFactorFormFields> = async (data) => {
    await loginTwoFactor({
      params: {loginTwoFactorData: data},
      onSuccess() {
        reset2fa();
        showToast({
          severity: 'success',
          summary: t('login-success-toast-summary'),
        });
        router.push('/');
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError2fa('root', {message: t('error-401-403')});
        } else if (error.response.status === 500) {
          setError2fa('root', {message: t('error-500')});
        } else {
          setError2fa('root', {message: t('error-default')});
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center">
      <h2>{t('title')}</h2>
      <p className="mt-6 md:mt-10 lg:mt-12">{t('description')}</p>
      <form
        className="mt-4 flex flex-col items-center gap-4 md:mt-6 md:gap-6 lg:mt-8 lg:gap-8"
        onSubmit={handleSubmit2fa(onSubmit2fa)}
      >
        <FloatLabelInputText
          {...register2fa('code')}
          maxLength={6}
          label={t('code-input-label')}
          data-testid="login-2fa"
        />
        {errors2fa.code ? <p className="text-red-700">{errors2fa.code.message}</p> : null}
        <Button
          label={isSubmitting2fa ? t('submit-button-loading-label') : t('submit-button-label')}
          type="submit"
          disabled={isSubmitting2fa}
          data-testid="login-submit-2fa"
        />
        {errors2fa.root ? <p className="text-red-700">{errors2fa.root.message}</p> : null}
      </form>
    </div>
  );
}
