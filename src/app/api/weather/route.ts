import { NextResponse } from 'next/server';

import {
  fetchOpenMeteo,
  WEATHER_REVALIDATE_SECONDS,
} from '@/lib/server/weather';

export const revalidate = WEATHER_REVALIDATE_SECONDS;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');
    const gran = (searchParams.get('gran') ?? 'hourly') as 'hourly' | 'daily';
    const varsParam = searchParams.get('vars');
    const start = searchParams.get('start') ?? undefined;
    const end = searchParams.get('end') ?? undefined;

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

    const vars = varsParam?.split(',').filter(Boolean);

    const result = await fetchOpenMeteo({
      lat,
      lon,
      gran,
      vars,
      start,
      end,
    });

    if (!result.ok) {
      if (result.error === 'invalid_schema') {
        return NextResponse.json(
          { error: result.message, details: result.details },
          { status: result.status }
        );
      }

      if (result.error === 'network') {
        return NextResponse.json(
          { error: 'Failed to fetch weather data', message: result.message },
          { status: result.status }
        );
      }

      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
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
