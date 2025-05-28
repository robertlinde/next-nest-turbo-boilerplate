import {ApiError} from './api-error.ts';

/**
 * A function that handles API requests and manages authentication tokens. It automatically retries the request if the token is expired and refreshes it.
 * If the refresh token is also expired, it redirects the user to the login page.
 */
export const apiRequestHandler = async (
  input: string | URL | globalThis.Request,
  init: RequestInit = {},
): Promise<Response> => {
  let inputResponse = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  if (inputResponse.status === 401) {
    // eslint-disable-next-line n/prefer-global/process
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Retry original request
      inputResponse = await fetch(input, {
        ...init,
        credentials: 'include',
      });
    } else {
      throw new ApiError('Unauthorized', refreshResponse);
    }
  }

  if (!inputResponse.ok) {
    if (inputResponse.status === 401) {
      throw new ApiError('Unauthorized', inputResponse);
    }

    if (inputResponse.status === 500) {
      throw new ApiError('Internal Server Error', inputResponse);
    }

    throw new ApiError('Error', inputResponse);
  }

  return inputResponse;
};
