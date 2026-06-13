import { ShareButton } from '@/components/ShareButton';
import { ThemeToggle } from '@/components/ThemeToggle';

import { siteConfig } from '@/constant/config';

export function DashboardHeader() {
  return (
    <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>Weather Dashboard</h1>
        <p className='text-base-content/70'>
          {siteConfig.dashboardDescription}
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
        <ShareButton />
        <ThemeToggle />
      </div>
    </header>
  );
}
