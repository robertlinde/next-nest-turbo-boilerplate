'use client';

import {type JSX} from 'react';

// Error boundaries must be Client Components

const GlobalError = ({reset, error}: {error: Error; reset: () => void}): JSX.Element => {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <p>{error.message}</p>
        <button
          onClick={() => {
            reset();
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
