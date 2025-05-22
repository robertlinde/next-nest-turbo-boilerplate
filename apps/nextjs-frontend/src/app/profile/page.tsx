'use client';

import {type JSX, useEffect} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {Button} from 'primereact/button';
import {type SubmitHandler, useForm} from 'react-hook-form';

import {deleteProfile} from './services/delete-profile.service';
import {updateProfile} from './services/update-profile.service';
import {type ProfileFormFields} from './types/profile-form-fields.type';
import {profileSchema} from './types/profile.schema';

import {FloatLabelInputText} from '@/components/FloatLabelInputText/FloatLabelInputText.component';

import {useAuthApi} from '@/hooks/useAuthApi/useAuthApi';
import {useConfirmDialog} from '@/hooks/useConfirmDialog/useConfirmDialog';
import {useToast} from '@/hooks/useToast/useToast';
import {useUserStore} from '@/store/user.store';
import {type ApiError} from '@/utils/api/api-error';

export default function Profile(): JSX.Element {
  const {user, loading, error, loadUser} = useUserStore();

  const router = useRouter();

  const {showToast} = useToast();

  const {logout} = useAuthApi();

  const {confirmDialog} = useConfirmDialog();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting, dirtyFields},
  } = useForm<ProfileFormFields>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (error || (!user && !loading)) {
      showToast({
        severity: 'error',
        summary: 'Error loading profile',
        detail: 'Please log in to access your profile.',
      });
      router.push('/login');
    }

    if (user) {
      reset({
        email: user.email,
        username: user.username,
      });
    }
  }, [error, loading, user]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    async onSuccess() {
      await loadUser();
      showToast({
        severity: 'success',
        summary: 'Profile update successful',
        detail: 'Your profile has been updated successfully.',
      });
    },
    async onError(error: ApiError) {
      switch (error.response.status) {
        case 400: {
          const response = (await error.response.json()) as {message: string[]};
          const errorMessage: string = response.message.join(', ');
          setError('root', {message: errorMessage});

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

  const onSubmitUpdate: SubmitHandler<ProfileFormFields> = async (data) => {
    const keysChanged = Object.keys(dirtyFields);

    if (keysChanged.length === 0) {
      showToast({
        severity: 'info',
        summary: 'No changes detected',
        detail: 'Please make some changes before updating your profile.',
      });
      return;
    }

    confirmDialog({
      message: 'Are you sure you want to update your profile?',
      header: 'Confirm profile update',
      accept() {
        const changedData: ProfileFormFields = {};

        for (const key of keysChanged) {
          changedData[key as keyof ProfileFormFields] = data[key as keyof ProfileFormFields];
        }

        updateProfileMutation.mutate(changedData);
      },
      reject() {
        reset();
      },
    });
  };

  const deleteProfileMutation = useMutation({
    mutationFn: deleteProfile,
    async onSuccess() {
      await logout();
      showToast({
        severity: 'success',
        summary: 'Deleted profile successfully',
        detail: 'Hope to see you again!',
      });
      router.push('/');
    },
    async onError(error: ApiError) {
      switch (error.response.status) {
        case 400: {
          const response = (await error.response.json()) as {message: string[]};
          const errorMessage: string = response.message.join(', ');
          showToast({
            severity: 'error',
            summary: 'Error deleting profile',
            detail: errorMessage,
          });
          break;
        }

        default: {
          showToast({
            severity: 'error',
            summary: 'Error deleting profile',
            detail: 'An unknown error occurred. Please try again later.',
          });
        }
      }
    },
  });

  const onDelete = (): void => {
    confirmDialog({
      message: 'Are you sure you want to delete your profile?',
      header: 'Confirm profile deletion',
      accept() {
        deleteProfileMutation.mutate();
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <>
      <h1>Hey, {user?.username}!</h1>
      <div className="flex max-w-3xl flex-col gap-4 divide-y-2 divide-slate-300 md:gap-6 lg:gap-8">
        <form onSubmit={handleSubmit(onSubmitUpdate)} className="mt-6 flex flex-col gap-8 md:mt-10 lg:mt-12">
          <FloatLabelInputText label="Email" {...register('email')} type="email" className="w-full" />
          <FloatLabelInputText label="Username" {...register('username')} type="text" className="w-full" />
          <FloatLabelInputText label="Password" {...register('password')} type="password" className="w-full" />
          {errors.root && <p className="text-red-700">{errors.root.message}</p>}
          <div className="flex w-full justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              label={isSubmitting ? 'Saving ...' : 'Update profile'}
              className="w-fit"
            />
          </div>
        </form>
        <div className="flex flex-row flex-wrap justify-between gap-2 pt-4 md:pt-6 lg:pt-8">
          <Button
            onClick={async () =>
              logout({
                onSuccess() {
                  router.push('/');
                },
              })
            }
            label="Logout"
            icon="pi pi-sign-out"
          />
          <Button
            onClick={onDelete}
            label="Delete account"
            icon="pi pi-trash"
            className="!bg-red-700 text-white hover:bg-red-600"
          />
        </div>
      </div>
    </>
  );
}
