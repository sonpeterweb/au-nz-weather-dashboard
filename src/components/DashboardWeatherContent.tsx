import dynamic from 'next/dynamic';

import type {
  DashboardGranularity,
  DashboardView,
} from '@/lib/dashboard-params';
import { getLocationById } from '@/lib/locations';
import type { DailyResp, HourlyResp } from '@/lib/schema';
import { fetchOpenMeteo } from '@/lib/server/weather';

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

  const result = await fetchOpenMeteo({
    lat: location.lat,
    lon: location.lon,
    gran,
    vars,
    start,
    end,
  });

  if (!result.ok) {
    return { cityId, status: 'fetch_failed' };
  }

  return {
    cityId,
    status: 'success',
    data: {
      id: cityId,
      label: location.label,
      data: result.data,
    },
  };
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
