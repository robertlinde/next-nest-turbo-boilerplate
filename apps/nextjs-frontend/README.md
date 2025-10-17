# � Next.js Frontend Boilerplate

A modern, fully-typed, and scalable frontend boilerplate built with:

- Next.js (App Router)
- TypeScript
- PrimeReact
- Tailwind CSS
- React Hook Form
- Zod
- React Query
- next-intl (i18n)

---

## 🚀 Features

✅ API integration layer using **React Query**

✅ Built-in **form validation** with Zod + React Hook Form

✅ Strong typing throughout

✅ Tailwind + PrimeReact UI components ready to go

✅ Localization with next-intl (i18n):

- Easily add and manage static translations
- Language switching feature
- Supports dynamic localization

## Examples

This section provides practical examples of how to implement common functionalities using the technologies integrated into this boilerplate.

### Example for how to use Zod with React Hook Form and React Query

```tsx
// profile.schema.ts
import {z} from 'zod';

export const profileSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().email().max(100))
    .optional(),
  username: z
    .string()
    .transform((val) => val.trim())
    .pipe(z.string().min(4).max(20))
    .optional(),
  password: z.string().min(4).max(128).optional(),
});

export type ProfileFormFields = z.infer<typeof profileSchema>;

// UserProfileForm.component.tsx
import {useEffect} from 'react';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {profileSchema, type ProfileFormFields} from './profile.schema';

const fetchUserProfile = async (): Promise<ProfileFormFields> => {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

const updateUserProfile = async (profileData: ProfileFormFields) => {
  const response = await fetch('/api/user/profile', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

export const UserProfileForm = (): JSX.Element => {
  const queryClient = useQueryClient();

  // Fetch user profile data
  const {
    data: profileData,
    isLoading: isFetchingProfile,
    error: fetchError,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: {errors, isSubmitting, dirtyFields},
  } = useForm<ProfileFormFields>({
    resolver: zodResolver(profileSchema),
  });

  // Populate form with fetched data
  useEffect(() => {
    if (profileData) {
      reset(profileData);
    }
  }, [profileData, reset]);

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(['userProfile'], data);
      // Reset form with new values to clear dirty state
      reset(data);
    },
    onError: (error: Error) => {
      setError('root', {
        message: error.message || 'Failed to update profile',
      });
    },
  });

  const onSubmit: SubmitHandler<ProfileFormFields> = async (data) => {
    mutation.mutate(data);
  };

  const isLoading = isSubmitting || mutation.isPending;
  const hasChanges = Object.keys(dirtyFields).length > 0;

  // Show loading state while fetching initial data
  if (isFetchingProfile) {
    return <div>Loading profile...</div>;
  }

  // Show error if initial fetch failed
  if (fetchError) {
    return <div className="error-text">Error loading profile: {fetchError.message}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        {...register('email')}
        className={errors.email ? 'input-error' : 'input'}
        placeholder="Email"
      />
      {errors.email && <p className="error-text">{errors.email.message}</p>}

      <input
        type="text"
        {...register('username')}
        className={errors.username ? 'input-error' : 'input'}
        placeholder="Username"
      />
      {errors.username && <p className="error-text">{errors.username.message}</p>}

      <input
        type="password"
        {...register('password')}
        className={errors.password ? 'input-error' : 'input'}
        placeholder="Password (leave blank to keep current)"
      />
      {errors.password && <p className="error-text">{errors.password.message}</p>}

      {(errors.root || mutation.isError) && (
        <p className="error-text">{errors.root?.message || mutation.error?.message}</p>
      )}

      {mutation.isSuccess && <p className="success-text">Profile updated successfully!</p>}

      <button type="submit" disabled={isLoading || !hasChanges}>
        {isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
```

### Example for how to use next-intl for localization

```tsx
import {useTranslations} from 'next-intl';

const UserProfile = () => {
  const t = useTranslations('UserProfile');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('email')}: user@example.com</p>
      <p>{t('username')}: user123</p>
    </div>
  );
};
```
