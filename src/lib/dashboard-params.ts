import { isValidLocationId } from '@/lib/locations';

export type DashboardRole = 'manager' | 'analyst';
export type DashboardGranularity = 'hourly' | 'daily';

export const DASHBOARD_ROLES: DashboardRole[] = ['manager', 'analyst'];
export const DASHBOARD_GRANULARITIES: DashboardGranularity[] = [
  'hourly',
  'daily',
];

export const HOURLY_VARIABLES = [
  'temperature_2m',
  'precipitation',
  'windspeed_10m',
] as const;

export const DAILY_VARIABLES = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'windspeed_10m_max',
] as const;

export const VARIABLE_LABELS: Record<string, string> = {
  temperature_2m: 'Temperature',
  precipitation: 'Precipitation',
  windspeed_10m: 'Wind speed',
  temperature_2m_max: 'Max temperature',
  temperature_2m_min: 'Min temperature',
  precipitation_sum: 'Rainfall',
  windspeed_10m_max: 'Max wind speed',
};

export const MAX_DATE_RANGE_DAYS = 30;
export const DEFAULT_DATE_RANGE_DAYS = 7;

export function getDefaultDateRange(): { start: string; end: string } {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + DEFAULT_DATE_RANGE_DAYS);

  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  return {
    start: formatDate(today),
    end: formatDate(endDate),
  };
}

export function getDefaultVariables(
  granularity: DashboardGranularity
): string[] {
  if (granularity === 'hourly') {
    return [...HOURLY_VARIABLES];
  }
  return ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'];
}

export function getVariableOptions(
  granularity: DashboardGranularity
): Array<{ id: string; label: string }> {
  const variables =
    granularity === 'hourly' ? HOURLY_VARIABLES : DAILY_VARIABLES;

  return variables.map((id) => ({
    id,
    label: VARIABLE_LABELS[id] ?? id,
  }));
}

export function validateDateRange(
  start: string,
  end: string
): { isValid: boolean; error?: string } {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (startDate > endDate) {
    return { isValid: false, error: 'Start date must be before end date' };
  }

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > MAX_DATE_RANGE_DAYS) {
    return {
      isValid: false,
      error: `Date range exceeds maximum of ${MAX_DATE_RANGE_DAYS} days (${diffDays} days)`,
    };
  }

  return { isValid: true };
}

export type DashboardParamUpdates = Record<
  string,
  string | string[] | undefined
>;

export function buildDashboardSearchParams(
  current: URLSearchParams,
  updates: DashboardParamUpdates
): URLSearchParams {
  const params = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      params.delete(key);
      continue;
    }

    params.set(key, Array.isArray(value) ? value.join(',') : value);
  }

  return params;
}

export interface ParsedDashboardParams {
  role: DashboardRole;
  gran: DashboardGranularity;
  cities: string[];
  validCities: string[];
  invalidCities: string[];
  vars: string[];
  invalidVars: string[];
  start: string;
  end: string;
  dateError?: string;
  paramWarnings: string[];
}

function getAllowedVariables(granularity: DashboardGranularity): string[] {
  return granularity === 'hourly'
    ? [...HOURLY_VARIABLES]
    : [...DAILY_VARIABLES];
}

export function parseDashboardParams(
  params: Record<string, string | string[] | undefined>
): ParsedDashboardParams {
  const paramWarnings: string[] = [];
  const defaultDateRange = getDefaultDateRange();

  const roleParam = params.role ? String(params.role) : 'manager';
  const role = DASHBOARD_ROLES.includes(roleParam as DashboardRole)
    ? (roleParam as DashboardRole)
    : 'manager';
  if (params.role && roleParam !== role) {
    paramWarnings.push(
      `Invalid role "${roleParam}". Using manager view instead.`
    );
  }

  const granParam = params.gran ? String(params.gran) : 'hourly';
  const gran = DASHBOARD_GRANULARITIES.includes(
    granParam as DashboardGranularity
  )
    ? (granParam as DashboardGranularity)
    : 'hourly';
  if (params.gran && granParam !== gran) {
    paramWarnings.push(
      `Invalid granularity "${granParam}". Using hourly data instead.`
    );
  }

  const cityParam = params.city ?? 'auckland';
  const cities = String(cityParam)
    .split(',')
    .map((city) => city.trim())
    .filter(Boolean);
  const validCities = cities.filter((city) => isValidLocationId(city));
  const invalidCities = cities.filter((city) => !isValidLocationId(city));

  const allowedVariables = getAllowedVariables(gran);
  const varsParam = params.vars;
  const requestedVars = varsParam
    ? String(varsParam)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : getDefaultVariables(gran);
  const vars = requestedVars.filter((item) => allowedVariables.includes(item));
  const invalidVars = requestedVars.filter(
    (item) => !allowedVariables.includes(item)
  );

  if (invalidVars.length > 0) {
    paramWarnings.push(
      `Unsupported variables for ${gran} data: ${invalidVars.join(', ')}.`
    );
  }

  if (vars.length === 0) {
    vars.push(...getDefaultVariables(gran));
    paramWarnings.push('No valid variables selected. Using default variables.');
  }

  const start = (params.start as string | undefined) ?? defaultDateRange.start;
  const end = (params.end as string | undefined) ?? defaultDateRange.end;
  const dateValidation = validateDateRange(start, end);

  return {
    role,
    gran,
    cities,
    validCities,
    invalidCities,
    vars,
    invalidVars,
    start,
    end,
    dateError: dateValidation.isValid ? undefined : dateValidation.error,
    paramWarnings,
  };
}
