'use client';

import type { DashboardView } from '@/lib/dashboard-params';
import { cn } from '@/lib/utils';
import { useDashboardSearchParams } from '@/hooks/useDashboardSearchParams';

interface ViewToggleProps {
  view: DashboardView;
}

const views: Array<{ id: DashboardView; label: string }> = [
  { id: 'summary', label: 'Summary' },
  { id: 'charts', label: 'Charts' },
];

export function ViewToggle({ view }: ViewToggleProps) {
  const { updateParams } = useDashboardSearchParams();

  return (
    <div className='join' role='group' aria-label='Dashboard view'>
      {views.map((item) => (
        <button
          key={item.id}
          type='button'
          className={cn(
            'btn join-item btn-sm sm:btn-md',
            view === item.id && 'btn-active'
          )}
          aria-pressed={view === item.id}
          onClick={() => updateParams({ view: item.id })}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
