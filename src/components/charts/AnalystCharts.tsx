'use client';

import type { CityWeatherResult } from '@/lib/chart-utils';
import { buildChartPanels } from '@/lib/chart-utils';

import { RainfallBar } from './RainfallBar';
import { TemperatureLine } from './TemperatureLine';
import { WindArea } from './WindArea';

interface AnalystChartsProps {
  cities: CityWeatherResult[];
  gran: 'hourly' | 'daily';
  vars: string[];
}

export function AnalystCharts({ cities, gran, vars }: AnalystChartsProps) {
  const panels = buildChartPanels(cities, gran, vars);

  if (panels.length === 0) {
    return (
      <div className='rounded-lg bg-base-200 p-6 text-center text-base-content/70'>
        No chartable variables selected. Choose temperature, precipitation, or
        wind variables to display charts.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {panels.map((panel) => {
        const sharedProps = {
          title: panel.title,
          unit: panel.unit,
          data: panel.data,
          series: panel.series,
          gran,
        };

        switch (panel.type) {
          case 'line':
            return <TemperatureLine key={panel.id} {...sharedProps} />;
          case 'bar':
            return <RainfallBar key={panel.id} {...sharedProps} />;
          case 'area':
            return <WindArea key={panel.id} {...sharedProps} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
