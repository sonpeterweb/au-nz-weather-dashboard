import type { Metadata } from 'next';
import Link from 'next/link';

import { ThemeToggle } from '@/components/ThemeToggle';

import { siteConfig } from '@/constant/config';

const techStack = [
  'Next.js 15',
  'React 19',
  'TypeScript',
  'Tailwind CSS 4',
  'DaisyUI',
  'Recharts',
  'Zod',
] as const;

export const metadata: Metadata = {
  title: 'Home',
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <main className='min-h-screen'>
      <div className='container mx-auto max-w-7xl px-4 py-6'>
        <header className='flex justify-end'>
          <ThemeToggle />
        </header>

        <section className='hero min-h-[calc(100vh-5rem)]'>
          <div className='hero-content flex-col px-4 py-12 text-center'>
            <div className='max-w-3xl space-y-6'>
              <h1 className='text-4xl font-bold sm:text-5xl'>
                {siteConfig.title}
              </h1>
              <p className='text-lg text-base-content/70 sm:text-xl'>
                {siteConfig.landingPitch}
              </p>

              <ul
                className='flex flex-wrap justify-center gap-2'
                aria-label='Tech stack'
              >
                {techStack.map((tech) => (
                  <li key={tech}>
                    <span className='badge badge-outline badge-sm'>{tech}</span>
                  </li>
                ))}
              </ul>

              <div>
                <Link href='/dashboard' className='btn btn-primary btn-lg'>
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
