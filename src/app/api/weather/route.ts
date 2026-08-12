import { NextResponse } from 'next/server';

import { buildUrl, isValidAU_NZCoords } from '@/lib/open-meteo';
import { ZDaily, ZHourly } from '@/lib/schema';

export const revalidate = 300; // 5 min

/**
 * Sleep utility for retry delays
 */
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
        next: { revalidate },
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const gran = (searchParams.get('gran') ?? 'hourly') as 'hourly' | 'daily';
    const varsParam = searchParams.get('vars');
    const start = searchParams.get('start') ?? undefined;
    const end = searchParams.get('end') ?? undefined;

    // Validate required parameters
    if (!latParam || !lonParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat and lon' },
        { status: 400 }
      );
    }

    const lat = Number(latParam);
    const lon = Number(lonParam);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: 'Invalid coordinates: lat and lon must be numbers' },
        { status: 400 }
      );
    }

    if (!isValidAU_NZCoords({ lat, lon })) {
      return NextResponse.json(
        {
          error: 'Coordinates must be within Australia or New Zealand bounds',
        },
        { status: 400 }
      );
    }

    const vars = varsParam?.split(',').filter(Boolean);

    const url = buildUrl({ lat, lon }, gran, { vars, start, end });

    const res = await fetchWithRetry(url);

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const data = await res.json();

    const parsed =
      gran === 'hourly' ? ZHourly.safeParse(data) : ZDaily.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid schema', details: parsed.error.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch weather data', message: error.message },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
