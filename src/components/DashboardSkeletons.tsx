import type { DashboardView } from '@/lib/dashboard-params';

import { Skeleton } from '@/components/Skeleton';

export function ControlsSkeleton() {
  return (
    <section
      className='rounded-lg bg-base-200 p-4 space-y-4'
      aria-label='Loading dashboard controls'
      aria-busy='true'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-10 w-40' />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-24 w-full' />
        <Skeleton className='h-24 w-full md:col-span-2 xl:col-span-2' />
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-12 w-full' />
      </div>
    </section>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div
      className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
      aria-label='Loading KPI cards'
      aria-busy='true'
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='card bg-base-100 shadow-sm'>
          <div className='card-body gap-3 p-4'>
            <Skeleton className='h-5 w-32' />
            <div className='grid grid-cols-3 gap-2'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartsSkeleton() {
  return (
    <div
      className='space-y-6'
      aria-label='Loading weather charts'
      aria-busy='true'
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='card bg-base-100 shadow-sm'>
          <div className='card-body gap-4 p-4'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-80 w-full' />
          </div>
        </div>
      ))}
    </div>
  );
}

interface WeatherContentSkeletonProps {
  view: DashboardView;
}

export function WeatherContentSkeleton({ view }: WeatherContentSkeletonProps) {
  return (
    <section
      className='space-y-4 animate-pulse'
      aria-label='Loading weather data'
      aria-busy='true'
    >
      <Skeleton className='h-6 w-36' />
      {view === 'summary' ? <KpiCardsSkeleton /> : <ChartsSkeleton />}
    </section>
  );
}

export function DashboardPageSkeleton() {
  return (
    <main className='container mx-auto max-w-7xl px-4 py-6'>
      <div className='space-y-6'>
        <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-9 w-64' />
            <Skeleton className='h-4 w-80 max-w-full' />
          </div>
          <Skeleton className='h-10 w-32' />
        </header>
        <ControlsSkeleton />
        <WeatherContentSkeleton view='summary' />
      </div>
    </main>
  );
}
