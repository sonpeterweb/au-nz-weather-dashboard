'use client';

import type { ReactNode } from 'react';

import { formatAxisTick } from '@/lib/chart-utils';

export const CHART_HEIGHT = 320;
export const ANIMATION_DURATION = 300;

interface ChartCardProps {
  title: string;
  unit: string;
  children: ReactNode;
}

export function ChartCard({ title, unit, children }: ChartCardProps) {
  return (
    <div className='card bg-base-100 shadow-sm'>
      <div className='card-body gap-4 p-4'>
        <div>
          <h3 className='card-title text-base'>{title}</h3>
          <p className='text-sm text-base-content/70'>Unit: {unit}</p>
        </div>
        <div className='h-80 min-h-80 w-full min-w-0'>{children}</div>
      </div>
    </div>
  );
}

export function formatChartTooltipValue(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
}

export function createAxisTickFormatter(gran: 'hourly' | 'daily') {
  return (value: string) => formatAxisTick(value, gran);
}

interface MultiSeriesTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
  unit: string;
  gran: 'hourly' | 'daily';
}

export function MultiSeriesTooltip({
  active,
  payload,
  label,
  unit,
  gran,
}: MultiSeriesTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className='rounded-lg border border-base-300 bg-base-100 p-3 shadow-md text-sm'>
      <p className='mb-2 font-semibold'>
        {label ? formatAxisTick(label, gran) : ''}
      </p>
      <ul className='space-y-1'>
        {payload.map((entry) => (
          <li
            key={entry.name}
            className='flex items-center gap-2'
            style={{ color: entry.color }}
          >
            <span className='font-medium'>{entry.name}:</span>
            <span>{formatChartTooltipValue(entry.value ?? 0, unit)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
