'use client';

import {type JSX} from 'react';

// Error boundaries must be Client Components

function GlobalError({reset, error}: {readonly error: Error; readonly reset: () => void}): JSX.Element {
  return (
    <html>
      <body>
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
      </body>
    </html>
  );
}

export default GlobalError;
