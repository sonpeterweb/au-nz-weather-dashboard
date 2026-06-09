'use client';

import type { DashboardRole } from '@/lib/dashboard-params';
import { cn } from '@/lib/utils';
import { useDashboardSearchParams } from '@/hooks/useDashboardSearchParams';

interface RoleToggleProps {
  role: DashboardRole;
}

const roles: Array<{ id: DashboardRole; label: string }> = [
  { id: 'manager', label: 'Manager' },
  { id: 'analyst', label: 'Analyst' },
];

export function RoleToggle({ role }: RoleToggleProps) {
  const { updateParams } = useDashboardSearchParams();

  return (
    <div className='join' role='group' aria-label='Dashboard view role'>
      {roles.map((item) => (
        <button
          key={item.id}
          type='button'
          className={cn(
            'btn join-item btn-sm sm:btn-md',
            role === item.id && 'btn-active'
          )}
          aria-pressed={role === item.id}
          onClick={() => updateParams({ role: item.id })}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
