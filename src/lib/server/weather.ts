import {
  type Coords,
  type Granularity,
  buildUrl,
  isValidAU_NZCoords,
} from '@/lib/open-meteo';
import { type DailyResp, type HourlyResp, ZDaily, ZHourly } from '@/lib/schema';

export const WEATHER_REVALIDATE_SECONDS = 300;

export interface FetchOpenMeteoParams extends Coords {
  gran: Granularity;
  vars?: string[];
  start?: string;
  end?: string;
}

export type WeatherSuccess = {
  ok: true;
  data: HourlyResp | DailyResp;
};

export type WeatherFailure = {
  ok: false;
  error: 'invalid_coords' | 'upstream' | 'invalid_schema' | 'network';
  message: string;
  status: number;
  details?: unknown;
};

export type WeatherResult = WeatherSuccess | WeatherFailure;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry only transient upstream failures (rate limit / server errors). */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Fetch with selective retry, backoff between attempts, and per-request timeout.
 * Retries: network/timeout errors, 429, 5xx. Does not retry other 4xx.
 */
async function fetchWithRetry(
  url: string,
  {
    maxAttempts = 3,
    timeoutMs = 10_000,
    // One delay per gap between attempts (3 attempts → 2 waits)
    delays = [1000, 2000],
  }: {
    maxAttempts?: number;
    timeoutMs?: number;
    delays?: number[];
  } = {}
): Promise<Response> {
  const backoff = (attempt: number) =>
    delays[Math.min(attempt, delays.length - 1)] ?? 1000;

  let lastResponse: Response | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        next: { revalidate: WEATHER_REVALIDATE_SECONDS },
        signal: controller.signal,
      });

      if (response.ok || !isRetryableStatus(response.status)) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      await sleep(backoff(attempt));
      continue;
    } finally {
      clearTimeout(timeoutId);
    }

    if (attempt === maxAttempts - 1) {
      break;
    }
    await sleep(backoff(attempt));
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new Error('All retry attempts failed');
}

/**
 * Shared Open-Meteo fetch + schema validation for Server Components and API routes.
 */
export async function fetchOpenMeteo(
  params: FetchOpenMeteoParams
): Promise<WeatherResult> {
  const { lat, lon, gran, vars, start, end } = params;

  if (!isValidAU_NZCoords({ lat, lon })) {
    return {
      ok: false,
      error: 'invalid_coords',
      message: 'Coordinates must be within Australia or New Zealand bounds',
      status: 400,
    };
  }

  try {
    const url = buildUrl({ lat, lon }, gran, { vars, start, end });
    const res = await fetchWithRetry(url);

    if (!res.ok) {
      return {
        ok: false,
        error: 'upstream',
        message: 'Upstream error',
        status: 502,
      };
    }

    const data: unknown = await res.json();
    const parsed =
      gran === 'hourly' ? ZHourly.safeParse(data) : ZDaily.safeParse(data);

    if (!parsed.success) {
      return {
        ok: false,
        error: 'invalid_schema',
        message: 'Invalid schema',
        status: 500,
        details: parsed.error.errors,
      };
    }

    return { ok: true, data: parsed.data };
  } catch (error) {
    return {
      ok: false,
      error: 'network',
      message:
        error instanceof Error ? error.message : 'Failed to fetch weather data',
      status: 502,
    };
  }
}
