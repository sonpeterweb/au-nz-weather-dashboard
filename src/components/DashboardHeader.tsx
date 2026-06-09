import { ThemeToggle } from '@/components/ThemeToggle';

export function DashboardHeader() {
  return (
    <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>Weather Dashboard</h1>
        <p className='text-base-content/70'>
          Monitor weather conditions across Australia and New Zealand
        </p>
      </div>
      <ThemeToggle />
    </header>
  );
}
