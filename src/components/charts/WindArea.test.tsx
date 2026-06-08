import { render, screen } from '@testing-library/react';

import { WindArea } from '@/components/charts/WindArea';

jest.mock(
  'recharts',
  () => jest.requireActual('@/components/charts/recharts.mock').rechartsMock
);

const chartData = [
  {
    time: '2025-01-21T00:00',
    auckland__windspeed_10m: 12,
  },
  {
    time: '2025-01-21T01:00',
    auckland__windspeed_10m: 15,
  },
];

const chartSeries = [
  {
    key: 'auckland__windspeed_10m',
    label: 'Auckland — Wind speed',
    color: '#2563eb',
  },
];

describe('WindArea', () => {
  it('renders chart card with area chart and series', () => {
    render(
      <WindArea
        title='Wind speed'
        unit='km/h'
        data={chartData}
        series={chartSeries}
        gran='hourly'
      />
    );

    expect(screen.getByText('Wind speed')).toBeInTheDocument();
    expect(screen.getByText('Unit: km/h')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toHaveAttribute(
      'data-points',
      '2'
    );
    expect(screen.getAllByTestId('area-series')).toHaveLength(1);
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });
});
