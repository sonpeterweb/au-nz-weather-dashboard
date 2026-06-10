import type { Metadata } from 'next';
import { Suspense } from 'react';

import { parseDashboardParams } from '@/lib/dashboard-params';

export const metadata: Metadata = {
  title: 'Weather Dashboard',
  description:
    'Monitor AU/NZ weather with manager KPIs, analyst charts, and shareable URL filters.',
};

import { DashboardControls } from '@/components/DashboardControls';
import { DashboardHeader } from '@/components/DashboardHeader';
import {
  ControlsSkeleton,
  WeatherContentSkeleton,
} from '@/components/DashboardSkeletons';
import { DashboardWeatherContent } from '@/components/DashboardWeatherContent';
import { ErrorMessage, ErrorMessageList } from '@/components/ErrorMessage';

interface DashboardPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function buildParamWarnings(
  parsed: ReturnType<typeof parseDashboardParams>
): Array<{
  id: string;
  title: string;
  message: string;
  variant: 'warning';
}> {
  const warnings = parsed.paramWarnings.map((message, index) => ({
    id: `param-warning-${index}`,
    title: 'Invalid URL parameter',
    message,
    variant: 'warning' as const,
  }));

  if (parsed.invalidCities.length > 0) {
    warnings.push({
      id: 'invalid-cities',
      title: 'Unknown cities',
      message: `These city IDs are not supported: ${parsed.invalidCities.join(
        ', '
      )}. Choose from the AU/NZ presets in the filter bar.`,
      variant: 'warning',
    });
  }

  return warnings;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const parsed = parseDashboardParams(await searchParams);
  const paramWarnings = buildParamWarnings(parsed);

  return (
    <main className='container mx-auto px-4 py-6 max-w-7xl'>
      <div className='space-y-6'>
        <DashboardHeader />

        <Suspense fallback={<ControlsSkeleton />}>
          <DashboardControls
            role={parsed.role}
            cities={
              parsed.validCities.length > 0 ? parsed.validCities : ['auckland']
            }
            gran={parsed.gran}
            vars={parsed.vars}
            start={parsed.start}
            end={parsed.end}
          />
        </Suspense>

        {parsed.dateError && (
          <ErrorMessage
            title='Date range error'
            message={parsed.dateError}
            variant='error'
          />
        )}

        <ErrorMessageList messages={paramWarnings} />

        {parsed.dateError ? null : parsed.validCities.length === 0 ? (
          <ErrorMessage
            title='No valid cities selected'
            message='Select at least one supported AU/NZ city to load weather data.'
            variant='error'
          />
        ) : (
          <Suspense fallback={<WeatherContentSkeleton role={parsed.role} />}>
            <DashboardWeatherContent
              cities={parsed.validCities}
              gran={parsed.gran}
              vars={parsed.vars}
              start={parsed.start}
              end={parsed.end}
              role={parsed.role}
            />
          </Suspense>
        )}
      </div>
    </main>
  );
}
