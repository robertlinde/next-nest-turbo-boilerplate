'use client';

import {type JSX} from 'react';

function Error({reset, error}: {readonly error: Error; readonly reset: () => void}): JSX.Element {
  return (
    <>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button
        type="button"
        onClick={() => {
          reset();
        }}
      >
        Try again
      </button>
    </>
  );
}

export default Error;
