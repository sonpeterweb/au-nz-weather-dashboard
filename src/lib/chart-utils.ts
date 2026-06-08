import type { DailyResp, HourlyResp } from '@/lib/schema';
import { formatDate, toSeries } from '@/lib/utils';

export type ChartType = 'line' | 'bar' | 'area';

export interface CityWeatherResult {
  id: string;
  label: string;
  data: HourlyResp | DailyResp;
}

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

export interface ChartPanel {
  id: string;
  type: ChartType;
  title: string;
  unit: string;
  data: Array<{ time: string; [key: string]: number | string }>;
  series: ChartSeries[];
}

export const CHART_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#ca8a04',
  '#9333ea',
  '#0891b2',
  '#ea580c',
  '#4f46e5',
] as const;

const VARIABLE_CHART_TYPE: Record<string, ChartType> = {
  temperature_2m: 'line',
  temperature_2m_max: 'line',
  temperature_2m_min: 'line',
  precipitation: 'bar',
  precipitation_sum: 'bar',
  windspeed_10m: 'area',
  windspeed_10m_max: 'area',
};

const VARIABLE_LABELS: Record<string, string> = {
  temperature_2m: 'Temperature',
  temperature_2m_max: 'Max temperature',
  temperature_2m_min: 'Min temperature',
  precipitation: 'Precipitation',
  precipitation_sum: 'Rainfall',
  windspeed_10m: 'Wind speed',
  windspeed_10m_max: 'Max wind speed',
};

const CHART_TYPE_META: Record<ChartType, { title: string; unit: string }> = {
  line: { title: 'Temperature', unit: '°C' },
  bar: { title: 'Precipitation', unit: 'mm' },
  area: { title: 'Wind speed', unit: 'km/h' },
};

/**
 * Transforms daily weather data into chart-friendly format
 */
export function toDailySeries(
  daily: DailyResp,
  key: string
): Array<{ time: string } & Record<string, number>> {
  const dailyData = daily.daily as Record<string, number[]>;
  return daily.daily.time.map(
    (t, i) =>
      ({
        time: t,
        [key]: dailyData[key]?.[i] ?? 0,
      } as { time: string } & Record<string, number>)
  );
}

/**
 * Formats time labels for chart X-axis ticks
 */
export function formatAxisTick(time: string, gran: 'hourly' | 'daily'): string {
  if (gran === 'hourly') {
    return formatDate(time, 'time');
  }
  return formatDate(time, 'medium');
}

function getSeriesLabel(cityLabel: string, variable: string): string {
  const varLabel = VARIABLE_LABELS[variable] ?? variable;
  return `${cityLabel} — ${varLabel}`;
}

function getSeriesKey(cityId: string, variable: string): string {
  return `${cityId}__${variable}`;
}

function extractSeries(
  city: CityWeatherResult,
  gran: 'hourly' | 'daily',
  variable: string
): Array<{ time: string; value: number }> {
  const points =
    gran === 'hourly'
      ? toSeries(city.data as HourlyResp, variable)
      : toDailySeries(city.data as DailyResp, variable);

  return points.map((point) => ({
    time: point.time,
    value: (point[variable] as number) ?? 0,
  }));
}

function mergeSeriesData(
  cities: CityWeatherResult[],
  gran: 'hourly' | 'daily',
  variables: string[]
): Array<{ time: string; [key: string]: number | string }> {
  const timeMap = new Map<
    string,
    { time: string; [key: string]: number | string }
  >();

  for (const city of cities) {
    for (const variable of variables) {
      const seriesKey = getSeriesKey(city.id, variable);
      const points = extractSeries(city, gran, variable);

      for (const point of points) {
        const existing = timeMap.get(point.time) ?? { time: point.time };
        existing[seriesKey] = point.value;
        timeMap.set(point.time, existing);
      }
    }
  }

  return Array.from(timeMap.values()).sort((a, b) =>
    String(a.time).localeCompare(String(b.time))
  );
}

function groupVariablesByChartType(
  vars: string[]
): Partial<Record<ChartType, string[]>> {
  const groups: Partial<Record<ChartType, string[]>> = {};

  for (const variable of vars) {
    const chartType = VARIABLE_CHART_TYPE[variable];
    if (!chartType) continue;

    groups[chartType] = groups[chartType] ?? [];
    groups[chartType].push(variable);
  }

  return groups;
}

/**
 * Builds chart panel configs for the Analyst view
 */
export function buildChartPanels(
  cities: CityWeatherResult[],
  gran: 'hourly' | 'daily',
  vars: string[]
): ChartPanel[] {
  if (cities.length === 0 || vars.length === 0) {
    return [];
  }

  const groups = groupVariablesByChartType(vars);
  const panels: ChartPanel[] = [];

  for (const [type, variables] of Object.entries(groups) as Array<
    [ChartType, string[]]
  >) {
    const meta = CHART_TYPE_META[type];
    const data = mergeSeriesData(cities, gran, variables);
    const series: ChartSeries[] = [];

    let colorIndex = 0;
    for (const city of cities) {
      for (const variable of variables) {
        const key = getSeriesKey(city.id, variable);
        series.push({
          key,
          label: getSeriesLabel(city.label, variable),
          color: CHART_COLORS[colorIndex % CHART_COLORS.length],
        });
        colorIndex += 1;
      }
    }

    panels.push({
      id: `${type}-${variables.join('-')}`,
      type,
      title: meta.title,
      unit: meta.unit,
      data,
      series,
    });
  }

  return panels;
}
