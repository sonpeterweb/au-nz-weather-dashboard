import type {
  DashboardGranularity,
  DashboardRole,
} from '@/lib/dashboard-params';
import { getLocationById } from '@/lib/locations';
import type { DailyResp, HourlyResp } from '@/lib/schema';

import { AnalystCharts } from '@/components/charts/AnalystCharts';
import { ErrorMessage, ErrorMessageList } from '@/components/ErrorMessage';
import { KpiCards } from '@/components/KpiCards';

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

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  return process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
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

  const url = `${getBaseUrl()}/api/weather?${qs.toString()}`;

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
  role: DashboardRole;
}

export async function DashboardWeatherContent({
  cities,
  gran,
  vars,
  start,
  end,
  role,
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

      {role === 'manager' && (
        <section aria-labelledby='manager-view-heading'>
          <h2 id='manager-view-heading' className='text-lg font-semibold mb-4'>
            Manager View
          </h2>
          <KpiCards cities={weatherData} gran={gran} />
        </section>
      )}

      {role === 'analyst' && (
        <section aria-labelledby='analyst-view-heading'>
          <h2 id='analyst-view-heading' className='text-lg font-semibold mb-4'>
            Analyst View
          </h2>
          <AnalystCharts cities={weatherData} gran={gran} vars={vars} />
        </section>
      )}
    </section>
  );
}
