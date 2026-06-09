import { render, screen } from '@testing-library/react';

import { TemperatureLine } from '@/components/charts/TemperatureLine';

jest.mock(
  'recharts',
  () => jest.requireActual('@/components/charts/recharts.mock').rechartsMock
);

const chartData = [
  {
    time: '2025-01-21T00:00',
    auckland__temperature_2m: 20,
    sydney__temperature_2m: 22,
  },
  {
    time: '2025-01-21T01:00',
    auckland__temperature_2m: 21,
    sydney__temperature_2m: 23,
  },
];

const chartSeries = [
  {
    key: 'auckland__temperature_2m',
    label: 'Auckland — Temperature',
    color: '#2563eb',
  },
  {
    key: 'sydney__temperature_2m',
    label: 'Sydney — Temperature',
    color: '#dc2626',
  },
];

describe('TemperatureLine', () => {
  it('renders chart card with title and responsive line chart', () => {
    render(
      <TemperatureLine
        title='Temperature'
        unit='°C'
        data={chartData}
        series={chartSeries}
        gran='hourly'
      />
    );

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Unit: °C')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toHaveAttribute(
      'data-points',
      '2'
    );
    expect(screen.getAllByTestId('line-series')).toHaveLength(2);
  });
});
