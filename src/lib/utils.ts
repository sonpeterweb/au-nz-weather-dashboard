import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { DailyResp, HourlyResp } from './schema';

/** Merge classes with tailwind-merge with clsx full feature */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Transforms hourly weather data into chart-friendly format
 * @param hourly - Hourly weather response data
 * @param key - The weather variable key to extract (e.g., 'temperature_2m', 'precipitation')
 * @returns Array of objects with time and the specified variable value
 */
export function toSeries(
  hourly: HourlyResp,
  key: string
): Array<{ time: string } & Record<string, number>> {
  return hourly.hourly.time.map((t, i) => {
    const value =
      (hourly.hourly[key as keyof typeof hourly.hourly] as number[])?.[i] ?? 0;
    return {
      time: t,
      [key]: value,
    } as { time: string } & Record<string, number>;
  });
}

/**
 * Calculates the number of rainy days in the current month
 * @param daily - Daily weather response data
 * @returns Number of days with precipitation > 0 in the current month
 */
export function rainyDaysThisMonth(daily: DailyResp): number {
  const month = new Date().toISOString().slice(0, 7);
  const precipitationSum = (daily.daily as Record<string, number[]>)
    .precipitation_sum;
  return daily.daily.time.reduce(
    (acc, t, i) =>
      acc + (t.startsWith(month) && (precipitationSum?.[i] ?? 0) > 0 ? 1 : 0),
    0
  );
}

/**
 * Alert thresholds for extreme weather conditions
 */
export const ALERT_THRESHOLDS = {
  TEMPERATURE_HIGH: 35, // °C
  PRECIPITATION_HIGH: 50, // mm/day
  WIND_SPEED_HIGH: 25, // km/h
} as const;

export type AlertType = 'temperature' | 'precipitation' | 'wind';

export interface WeatherAlert {
  type: AlertType;
  severity: 'warning' | 'danger';
  message: string;
  value: number;
  threshold: number;
}

/**
 * Detects weather alerts based on temperature threshold
 * @param temperature - Temperature value in °C
 * @returns Alert object if threshold exceeded, null otherwise
 */
export function detectTemperatureAlert(
  temperature: number
): WeatherAlert | null {
  if (temperature > ALERT_THRESHOLDS.TEMPERATURE_HIGH) {
    return {
      type: 'temperature',
      severity: 'danger',
      message: `Extreme temperature: ${temperature.toFixed(1)}°C`,
      value: temperature,
      threshold: ALERT_THRESHOLDS.TEMPERATURE_HIGH,
    };
  }
  return null;
}

/**
 * Detects weather alerts based on precipitation threshold
 * @param precipitation - Precipitation value in mm/day
 * @returns Alert object if threshold exceeded, null otherwise
 */
export function detectPrecipitationAlert(
  precipitation: number
): WeatherAlert | null {
  if (precipitation > ALERT_THRESHOLDS.PRECIPITATION_HIGH) {
    return {
      type: 'precipitation',
      severity: 'warning',
      message: `Heavy rainfall: ${precipitation.toFixed(1)}mm/day`,
      value: precipitation,
      threshold: ALERT_THRESHOLDS.PRECIPITATION_HIGH,
    };
  }
  return null;
}

/**
 * Detects weather alerts based on wind speed threshold
 * @param windSpeed - Wind speed value in km/h
 * @returns Alert object if threshold exceeded, null otherwise
 */
export function detectWindAlert(windSpeed: number): WeatherAlert | null {
  if (windSpeed > ALERT_THRESHOLDS.WIND_SPEED_HIGH) {
    return {
      type: 'wind',
      severity: 'warning',
      message: `Strong winds: ${windSpeed.toFixed(1)}km/h`,
      value: windSpeed,
      threshold: ALERT_THRESHOLDS.WIND_SPEED_HIGH,
    };
  }
  return null;
}

/**
 * Detects all weather alerts from daily data
 * @param daily - Daily weather response data
 * @returns Array of alert objects
 */
export function detectAllAlerts(daily: DailyResp): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const dailyData = daily.daily as Record<string, number[]>;

  daily.daily.time.forEach((_, i) => {
    const tempMax = dailyData.temperature_2m_max?.[i];
    const precipitation = dailyData.precipitation_sum?.[i];
    const windSpeed = dailyData.windspeed_10m_max?.[i];

    if (tempMax !== undefined) {
      const alert = detectTemperatureAlert(tempMax);
      if (alert) alerts.push(alert);
    }

    if (precipitation !== undefined) {
      const alert = detectPrecipitationAlert(precipitation);
      if (alert) alerts.push(alert);
    }

    if (windSpeed !== undefined) {
      const alert = detectWindAlert(windSpeed);
      if (alert) alerts.push(alert);
    }
  });

  return alerts;
}

/**
 * Detects weather alerts from hourly data by checking peaks and daily rainfall totals.
 */
export function detectAllAlertsFromHourly(hourly: HourlyResp): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const hourlyData = hourly.hourly as Record<string, number[]>;
  const temps = hourlyData.temperature_2m ?? [];
  const precip = hourlyData.precipitation ?? [];
  const wind = hourlyData.windspeed_10m ?? [];

  if (temps.length > 0) {
    const alert = detectTemperatureAlert(Math.max(...temps));
    if (alert) alerts.push(alert);
  }

  if (wind.length > 0) {
    const alert = detectWindAlert(Math.max(...wind));
    if (alert) alerts.push(alert);
  }

  const dailyPrecip = new Map<string, number>();
  hourly.hourly.time.forEach((time, index) => {
    const day = time.slice(0, 10);
    const amount = precip[index] ?? 0;
    dailyPrecip.set(day, (dailyPrecip.get(day) ?? 0) + amount);
  });

  for (const total of Array.from(dailyPrecip.values())) {
    const alert = detectPrecipitationAlert(total);
    if (alert) alerts.push(alert);
  }

  return alerts;
}

/**
 * Detects weather alerts for hourly or daily weather responses.
 */
export function detectAlerts(
  data: HourlyResp | DailyResp,
  gran: 'hourly' | 'daily'
): WeatherAlert[] {
  return gran === 'hourly'
    ? detectAllAlertsFromHourly(data as HourlyResp)
    : detectAllAlerts(data as DailyResp);
}

export interface CityKpis {
  avgTemperature: number;
  totalPrecipitation: number;
  maxWindSpeed: number;
}

/**
 * Computes KPI metrics from hourly or daily weather data
 */
export function computeCityKpis(
  data: HourlyResp | DailyResp,
  gran: 'hourly' | 'daily'
): CityKpis {
  if (gran === 'hourly') {
    const hourly = data as HourlyResp;
    const hourlyData = hourly.hourly as Record<string, number[]>;
    const temps = hourlyData.temperature_2m ?? [];
    const precip = hourlyData.precipitation ?? [];
    const wind = hourlyData.windspeed_10m ?? [];

    const avgTemperature =
      temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;
    const totalPrecipitation = precip.reduce((a, b) => a + b, 0);
    const maxWindSpeed = wind.length > 0 ? Math.max(...wind) : 0;

    return { avgTemperature, totalPrecipitation, maxWindSpeed };
  }

  const daily = data as DailyResp;
  const dailyData = daily.daily as Record<string, number[]>;
  const tempMax = dailyData.temperature_2m_max ?? [];
  const tempMin = dailyData.temperature_2m_min ?? [];
  const precip = dailyData.precipitation_sum ?? [];
  const wind = dailyData.windspeed_10m_max ?? [];

  const avgTemperature =
    tempMax.length > 0
      ? tempMax.reduce((sum, max, i) => {
          const min = tempMin[i] ?? max;
          return sum + (max + min) / 2;
        }, 0) / tempMax.length
      : 0;
  const totalPrecipitation = precip.reduce((a, b) => a + b, 0);
  const maxWindSpeed = wind.length > 0 ? Math.max(...wind) : 0;

  return { avgTemperature, totalPrecipitation, maxWindSpeed };
}

/**
 * Summarizes alerts to one entry per type (highest value)
 */
export function summarizeAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  const byType = new Map<AlertType, WeatherAlert>();

  for (const alert of alerts) {
    const existing = byType.get(alert.type);
    if (!existing || alert.value > existing.value) {
      byType.set(alert.type, alert);
    }
  }

  return Array.from(byType.values());
}

/**
 * Formats a date string for display in charts and UI
 * @param dateString - ISO date string (e.g., '2025-01-21' or '2025-01-21T12:00')
 * @param format - Format type: 'short' (MM/DD), 'medium' (Mon DD), 'long' (Month DD, YYYY), 'time' (HH:MM)
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'medium' | 'long' | 'time' = 'medium'
): string {
  const date = new Date(dateString);

  if (format === 'time') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
    });
  }

  if (format === 'medium') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // long format
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
