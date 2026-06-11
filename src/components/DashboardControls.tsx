'use client';

import type {
  DashboardGranularity,
  DashboardView,
} from '@/lib/dashboard-params';

import { FilterBar } from '@/components/FilterBar';
import { ViewToggle } from '@/components/ViewToggle';

interface DashboardControlsProps {
  view: DashboardView;
  cities: string[];
  gran: DashboardGranularity;
  vars: string[];
  start: string;
  end: string;
}

export function DashboardControls({
  view,
  cities,
  gran,
  vars,
  start,
  end,
}: DashboardControlsProps) {
  return (
    <section
      className='rounded-lg bg-base-200 p-4 space-y-4'
      aria-label='Dashboard controls'
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <h2 className='text-lg font-semibold'>Controls</h2>
        <ViewToggle view={view} />
      </div>
      <FilterBar
        selectedCities={cities}
        granularity={gran}
        vars={vars}
        start={start}
        end={end}
      />
    </section>
  );
}
