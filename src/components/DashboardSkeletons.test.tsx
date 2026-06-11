import { render, screen } from '@testing-library/react';

import {
  ChartsSkeleton,
  ControlsSkeleton,
  DashboardPageSkeleton,
  KpiCardsSkeleton,
  WeatherContentSkeleton,
} from '@/components/DashboardSkeletons';

describe('DashboardSkeletons', () => {
  it('renders controls skeleton with accessible label', () => {
    render(<ControlsSkeleton />);
    expect(
      screen.getByLabelText('Loading dashboard controls')
    ).toBeInTheDocument();
  });

  it('renders KPI skeleton with accessible label', () => {
    render(<KpiCardsSkeleton />);
    expect(screen.getByLabelText('Loading KPI cards')).toBeInTheDocument();
  });

  it('renders charts skeleton with accessible label', () => {
    render(<ChartsSkeleton />);
    expect(screen.getByLabelText('Loading weather charts')).toBeInTheDocument();
  });

  it('renders view-specific weather skeleton', () => {
    render(<WeatherContentSkeleton view='charts' />);
    expect(screen.getByLabelText('Loading weather data')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading weather charts')).toBeInTheDocument();
  });

  it('renders full dashboard page skeleton', () => {
    render(<DashboardPageSkeleton />);
    expect(
      screen.getByLabelText('Loading dashboard controls')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Loading KPI cards')).toBeInTheDocument();
  });
});
