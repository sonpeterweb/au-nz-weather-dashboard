'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import {
  type DashboardParamUpdates,
  buildDashboardSearchParams,
} from '@/lib/dashboard-params';

export function useDashboardSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: DashboardParamUpdates) => {
      const nextParams = buildDashboardSearchParams(searchParams, updates);
      const query = nextParams.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { updateParams };
}
