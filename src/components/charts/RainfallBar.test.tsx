import { render, screen } from '@testing-library/react';

import { RainfallBar } from '@/components/charts/RainfallBar';

jest.mock(
  'recharts',
  () => jest.requireActual('@/components/charts/recharts.mock').rechartsMock
);

const chartData = [
  {
    time: '2025-01-21',
    auckland__precipitation_sum: 5,
    sydney__precipitation_sum: 8,
  },
];

const chartSeries = [
  {
    key: 'auckland__precipitation_sum',
    label: 'Auckland — Rainfall',
    color: '#2563eb',
  },
  {
    key: 'sydney__precipitation_sum',
    label: 'Sydney — Rainfall',
    color: '#dc2626',
  },
];

describe('RainfallBar', () => {
  it('renders chart card with bar chart and series', () => {
    render(
      <RainfallBar
        title='Precipitation'
        unit='mm'
        data={chartData}
        series={chartSeries}
        gran='daily'
      />
    );

    expect(screen.getByText('Precipitation')).toBeInTheDocument();
    expect(screen.getByText('Unit: mm')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toHaveAttribute('data-points', '1');
    expect(screen.getAllByTestId('bar-series')).toHaveLength(2);
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });
});
