import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <main className='container mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-12 text-center'>
      <p className='text-6xl font-bold text-base-content/20' aria-hidden='true'>
        404
      </p>
      <h1 className='mt-4 text-3xl font-bold'>Page not found</h1>
      <p className='mt-2 max-w-md text-base-content/70'>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link href='/dashboard' className='btn btn-primary mt-8'>
        Go to dashboard
      </Link>
    </main>
  );
}
