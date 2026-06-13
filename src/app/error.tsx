'use client';

import Link from 'next/link';
import * as React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className='container mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-12 text-center'>
      <p className='text-6xl font-bold text-error/30' aria-hidden='true'>
        !
      </p>
      <h1 className='mt-4 text-3xl font-bold'>Something went wrong</h1>
      <p className='mt-2 max-w-md text-base-content/70'>
        An unexpected error occurred while loading this page. Please try again
        or return to the dashboard.
      </p>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
        <button type='button' onClick={reset} className='btn btn-primary'>
          Try again
        </button>
        <Link href='/dashboard' className='btn btn-outline'>
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
