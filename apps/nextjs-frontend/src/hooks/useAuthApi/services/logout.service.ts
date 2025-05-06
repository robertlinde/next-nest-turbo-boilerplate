export const logout = async (): Promise<void> => {
  // eslint-disable-next-line n/prefer-global/process
  await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
