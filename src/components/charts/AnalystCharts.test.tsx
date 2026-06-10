import { render, screen } from '@testing-library/react';

import type { DailyResp, HourlyResp } from '@/lib/schema';

import { AnalystCharts } from '@/components/charts/AnalystCharts';

jest.mock('@/components/charts/TemperatureLine', () => ({
  TemperatureLine: () => <div data-testid='temperature-line-chart' />,
}));
jest.mock('@/components/charts/RainfallBar', () => ({
  RainfallBar: () => <div data-testid='rainfall-bar-chart' />,
}));
jest.mock('@/components/charts/WindArea', () => ({
  WindArea: () => <div data-testid='wind-area-chart' />,
}));

const hourlyData: HourlyResp = {
  hourly: {
    time: ['2025-01-21T00:00', '2025-01-21T01:00'],
    temperature_2m: [20, 22],
    precipitation: [1, 2],
    windspeed_10m: [10, 12],
  },
};

const dailyData: DailyResp = {
  daily: {
    time: ['2025-01-21', '2025-01-22'],
    temperature_2m_max: [30, 32],
    temperature_2m_min: [18, 20],
    precipitation_sum: [5, 8],
    windspeed_10m_max: [15, 18],
  },
};

describe('AnalystCharts', () => {
  it('shows empty state when no chartable variables are selected', () => {
    render(
      <AnalystCharts
        cities={[{ id: 'auckland', label: 'Auckland, NZ', data: hourlyData }]}
        gran='hourly'
        vars={[]}
      />
    );

    expect(
      screen.getByText(/No chartable variables selected/i)
    ).toBeInTheDocument();
  });

  it('renders chart panels for selected variables', () => {
    render(
      <AnalystCharts
        cities={[{ id: 'auckland', label: 'Auckland, NZ', data: hourlyData }]}
        gran='hourly'
        vars={['temperature_2m', 'precipitation', 'windspeed_10m']}
      />
    );

    expect(screen.getByTestId('temperature-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('rainfall-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('wind-area-chart')).toBeInTheDocument();
  });

  it('renders daily temperature line chart for daily variables', () => {
    render(
      <AnalystCharts
        cities={[{ id: 'sydney', label: 'Sydney, AU', data: dailyData }]}
        gran='daily'
        vars={['temperature_2m_max', 'temperature_2m_min']}
      />
    );

    expect(screen.getByTestId('temperature-line-chart')).toBeInTheDocument();
  });
});
