import { render, screen } from '@testing-library/react';

import type { DailyResp, HourlyResp } from '@/lib/schema';

import { KpiCards } from '@/components/KpiCards';

const hourlyData: HourlyResp = {
  hourly: {
    time: ['2025-01-21T00:00', '2025-01-21T01:00', '2025-01-21T02:00'],
    temperature_2m: [20, 22, 24],
    precipitation: [1, 2, 3],
    windspeed_10m: [10, 15, 20],
  },
};

const dailyData: DailyResp = {
  daily: {
    time: ['2025-01-21', '2025-01-22'],
    temperature_2m_max: [36, 30],
    temperature_2m_min: [18, 16],
    precipitation_sum: [55, 10],
    windspeed_10m_max: [30, 15],
  },
};

describe('KpiCards', () => {
  it('shows empty state when no cities provided', () => {
    render(<KpiCards cities={[]} gran='hourly' />);

    expect(
      screen.getByText(/No city data available to display KPIs/i)
    ).toBeInTheDocument();
  });

  it('renders single city KPI card with computed values', () => {
    render(
      <KpiCards
        cities={[{ id: 'auckland', label: 'Auckland', data: hourlyData }]}
        gran='hourly'
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Auckland' })
    ).toBeInTheDocument();
    expect(screen.getByText('22.0')).toBeInTheDocument();
    expect(screen.getByText('6.0')).toBeInTheDocument();
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('displays alert badges for daily threshold violations', () => {
    render(
      <KpiCards
        cities={[{ id: 'sydney', label: 'Sydney', data: dailyData }]}
        gran='daily'
      />
    );

    expect(screen.getByText('Alerts')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Rainfall')).toBeInTheDocument();
    expect(screen.getByText('Wind')).toBeInTheDocument();
  });

  it('renders comparison table for multiple cities', () => {
    render(
      <KpiCards
        cities={[
          { id: 'auckland', label: 'Auckland', data: hourlyData },
          { id: 'sydney', label: 'Sydney', data: hourlyData },
        ]}
        gran='hourly'
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByText('Auckland').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sydney').length).toBeGreaterThan(0);
    expect(screen.getAllByText('None').length).toBe(2);
  });
});
