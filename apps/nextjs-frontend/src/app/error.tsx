'use client';

import {type JSX} from 'react';

const Error = ({reset, error}: {error: Error; reset: () => void}): JSX.Element => {
  return (
    <>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button
        onClick={() => {
          reset();
        }}
      >
        Try again
      </button>
    </>
  );
};

export default Error;
