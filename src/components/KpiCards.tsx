import type { DailyResp, HourlyResp } from '@/lib/schema';
import {
  type CityKpis,
  computeCityKpis,
  detectAllAlerts,
  summarizeAlerts,
} from '@/lib/utils';

import { AlertList } from '@/components/AlertBadge';

export interface CityWeatherResult {
  id: string;
  label: string;
  data: HourlyResp | DailyResp;
}

interface KpiCardsProps {
  cities: CityWeatherResult[];
  gran: 'hourly' | 'daily';
}

interface CityKpiEntry {
  id: string;
  label: string;
  kpis: CityKpis;
  alerts: ReturnType<typeof summarizeAlerts>;
}

function buildCityEntries(
  cities: CityWeatherResult[],
  gran: 'hourly' | 'daily'
): CityKpiEntry[] {
  return cities.map((city) => ({
    id: city.id,
    label: city.label,
    kpis: computeCityKpis(city.data, gran),
    alerts:
      gran === 'daily'
        ? summarizeAlerts(detectAllAlerts(city.data as DailyResp))
        : [],
  }));
}

function KpiStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className='stat place-items-center p-2'>
      <div className='stat-title text-xs'>{label}</div>
      <div className='stat-value text-lg'>
        {value}
        <span className='text-sm font-normal text-base-content/70 ml-0.5'>
          {unit}
        </span>
      </div>
    </div>
  );
}

function CityKpiCard({
  entry,
  gran,
}: {
  entry: CityKpiEntry;
  gran: 'hourly' | 'daily';
}) {
  const precipUnit = gran === 'hourly' ? 'mm' : 'mm total';

  return (
    <div className='card bg-base-100 shadow-sm'>
      <div className='card-body p-4 gap-3'>
        <h3 className='card-title text-base'>{entry.label}</h3>

        <div className='stats stats-vertical sm:stats-horizontal shadow-none w-full'>
          <KpiStat
            label='Avg temp'
            value={entry.kpis.avgTemperature.toFixed(1)}
            unit='°C'
          />
          <KpiStat
            label={gran === 'hourly' ? 'Precipitation' : 'Total rain'}
            value={entry.kpis.totalPrecipitation.toFixed(1)}
            unit={precipUnit}
          />
          <KpiStat
            label='Max wind'
            value={entry.kpis.maxWindSpeed.toFixed(1)}
            unit='km/h'
          />
        </div>

        {entry.alerts.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-base-content/70'>
              Alerts
            </p>
            <AlertList alerts={entry.alerts} />
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonTable({ entries }: { entries: CityKpiEntry[] }) {
  return (
    <div className='overflow-x-auto rounded-lg bg-base-100 shadow-sm'>
      <table className='table table-zebra'>
        <thead>
          <tr>
            <th>City</th>
            <th>Avg temp (°C)</th>
            <th>Total rain (mm)</th>
            <th>Max wind (km/h)</th>
            <th>Alerts</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className='font-medium'>{entry.label}</td>
              <td>{entry.kpis.avgTemperature.toFixed(1)}</td>
              <td>{entry.kpis.totalPrecipitation.toFixed(1)}</td>
              <td>{entry.kpis.maxWindSpeed.toFixed(1)}</td>
              <td>
                {entry.alerts.length > 0 ? (
                  <AlertList alerts={entry.alerts} />
                ) : (
                  <span className='text-base-content/50 text-sm'>None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function KpiCards({ cities, gran }: KpiCardsProps) {
  if (cities.length === 0) {
    return (
      <div className='rounded-lg bg-base-200 p-6 text-center text-base-content/70'>
        No city data available to display KPIs.
      </div>
    );
  }

  const entries = buildCityEntries(cities, gran);

  if (entries.length === 1) {
    return (
      <div className='max-w-md'>
        <CityKpiCard entry={entries[0]} gran={gran} />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <ComparisonTable entries={entries} />
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
        {entries.map((entry) => (
          <CityKpiCard key={entry.id} entry={entry} gran={gran} />
        ))}
      </div>
    </div>
  );
}
