import {ApiError} from './api-error';

/**
 * A function that handles API requests and manages authentication tokens. It automatically retries the request if the token is expired and refreshes it.
 * If the refresh token is also expired, it redirects the user to the login page.
 * @param input - The input parameter can be a string, URL, or Request object.
 * @param init - The init parameter is an optional object that can contain additional options for the fetch request.
 * @returns - A Promise that resolves to a Response object.
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
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      // Retry original request
      inputResponse = await fetch(input, {
        ...init,
        credentials: 'include',
      });
    } else {
      throw new ApiError('Unauthorized', refreshRes);
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
