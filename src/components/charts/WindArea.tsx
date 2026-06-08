'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartSeries } from '@/lib/chart-utils';

import {
  ANIMATION_DURATION,
  ChartCard,
  createAxisTickFormatter,
  MultiSeriesTooltip,
} from './chart-shared';

interface WindAreaProps {
  title: string;
  unit: string;
  data: Array<{ time: string; [key: string]: number | string }>;
  series: ChartSeries[];
  gran: 'hourly' | 'daily';
}

export function WindArea({ title, unit, data, series, gran }: WindAreaProps) {
  return (
    <ChartCard title={title} unit={unit}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray='3 3' className='stroke-base-300' />
          <XAxis
            dataKey='time'
            tickFormatter={createAxisTickFormatter(gran)}
            minTickGap={24}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: unit,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12 },
            }}
          />
          <Tooltip content={<MultiSeriesTooltip unit={unit} gran={gran} />} />
          <Legend />
          {series.map((item) => (
            <Area
              key={item.key}
              type='monotone'
              dataKey={item.key}
              name={item.label}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.2}
              strokeWidth={2}
              isAnimationActive
              animationDuration={ANIMATION_DURATION}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
