import dynamic from 'next/dynamic';
import { headers } from 'next/headers';

import type {
  DashboardGranularity,
  DashboardView,
} from '@/lib/dashboard-params';
import { getLocationById } from '@/lib/locations';
import type { DailyResp, HourlyResp } from '@/lib/schema';

import { ChartsSkeleton } from '@/components/DashboardSkeletons';
import { ErrorMessage, ErrorMessageList } from '@/components/ErrorMessage';
import { KpiCards } from '@/components/KpiCards';

const AnalystCharts = dynamic(
  () =>
    import('@/components/charts/AnalystCharts').then((mod) => ({
      default: mod.AnalystCharts,
    })),
  { loading: () => <ChartsSkeleton /> }
);

interface CityWeatherData {
  id: string;
  label: string;
  data: HourlyResp | DailyResp;
}

type FetchStatus = 'success' | 'fetch_failed';

interface CityFetchResult {
  cityId: string;
  status: FetchStatus;
  data?: CityWeatherData;
}

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const headersList = await headers();
  const host = headersList.get('host');

  if (host) {
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://au-nz-weather-dashboard.vercel.app'
    : 'http://localhost:3000';
}

async function fetchCityWeather(
  cityId: string,
  gran: DashboardGranularity,
  vars: string[],
  start: string,
  end: string
): Promise<CityFetchResult> {
  const location = getLocationById(cityId);
  if (!location) {
    return { cityId, status: 'fetch_failed' };
  }

  const qs = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon),
    gran,
    vars: vars.join(','),
    start,
    end,
  });

  const url = `${await getBaseUrl()}/api/weather?${qs.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return { cityId, status: 'fetch_failed' };
    }

    const data = await response.json();
    return {
      cityId,
      status: 'success',
      data: {
        id: cityId,
        label: location.label,
        data: data as HourlyResp | DailyResp,
      },
    };
  } catch {
    return { cityId, status: 'fetch_failed' };
  }
}

interface DashboardWeatherContentProps {
  cities: string[];
  gran: DashboardGranularity;
  vars: string[];
  start: string;
  end: string;
  view: DashboardView;
}

export async function DashboardWeatherContent({
  cities,
  gran,
  vars,
  start,
  end,
  view,
}: DashboardWeatherContentProps) {
  const results = await Promise.all(
    cities.map((cityId) => fetchCityWeather(cityId, gran, vars, start, end))
  );

  const weatherData = results
    .filter(
      (result): result is CityFetchResult & { data: CityWeatherData } =>
        result.status === 'success' && result.data !== undefined
    )
    .map((result) => result.data);

  const failedCities = results
    .filter((result) => result.status === 'fetch_failed')
    .map((result) => result.cityId);

  const fetchErrors = failedCities.map((cityId) => ({
    id: `fetch-${cityId}`,
    title: 'Weather data unavailable',
    message: `Unable to load weather data for "${cityId}" after multiple retry attempts. Please try again later.`,
    variant: 'warning' as const,
  }));

  if (weatherData.length === 0) {
    return (
      <section className='space-y-4 transition-opacity duration-300'>
        <ErrorMessageList messages={fetchErrors} />
        <ErrorMessage
          title='No data available'
          message='No weather data could be loaded for the selected cities. Check your filters or try again later.'
          variant='error'
        />
      </section>
    );
  }

  return (
    <section className='space-y-6 transition-opacity duration-300'>
      <ErrorMessageList messages={fetchErrors} />

      {view === 'summary' && (
        <section aria-labelledby='summary-view-heading'>
          <h2 id='summary-view-heading' className='text-lg font-semibold mb-4'>
            Summary
          </h2>
          <KpiCards cities={weatherData} gran={gran} />
        </section>
      )}

      {view === 'charts' && (
        <section aria-labelledby='charts-view-heading'>
          <h2 id='charts-view-heading' className='text-lg font-semibold mb-4'>
            Charts
          </h2>
          <AnalystCharts cities={weatherData} gran={gran} vars={vars} />
        </section>
      )}
    </section>
  );
}
