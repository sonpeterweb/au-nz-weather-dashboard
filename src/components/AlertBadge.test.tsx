import { render, screen } from '@testing-library/react';

import type { WeatherAlert } from '@/lib/utils';

import { AlertBadge, AlertList } from '@/components/AlertBadge';

const temperatureAlert: WeatherAlert = {
  type: 'temperature',
  severity: 'danger',
  message: 'Extreme temperature: 36.0°C',
  value: 36,
  threshold: 35,
};

const windAlert: WeatherAlert = {
  type: 'wind',
  severity: 'warning',
  message: 'Strong winds: 30.0km/h',
  value: 30,
  threshold: 25,
};

const rainfallAlert: WeatherAlert = {
  type: 'precipitation',
  severity: 'warning',
  message: 'Heavy rainfall: 55.0mm/day',
  value: 55,
  threshold: 50,
};

describe('AlertBadge', () => {
  it('renders alert type and message', () => {
    render(<AlertBadge alert={temperatureAlert} />);

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Extreme temperature: 36.0°C')).toBeInTheDocument();
  });

  it('applies danger styling for temperature alerts', () => {
    render(<AlertBadge alert={temperatureAlert} />);

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('badge-error');
  });

  it('applies warning styling for wind alerts', () => {
    render(<AlertBadge alert={windAlert} />);

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('badge-warning');
  });

  it('applies warning styling for rainfall alerts', () => {
    render(<AlertBadge alert={rainfallAlert} />);

    const badge = screen.getByRole('status');
    expect(badge).toHaveClass('badge-warning');
    expect(screen.getByText('Heavy rainfall: 55.0mm/day')).toBeInTheDocument();
  });

  it('exposes accessible label', () => {
    render(<AlertBadge alert={temperatureAlert} />);

    expect(screen.getByLabelText(/Temperature alert/i)).toBeInTheDocument();
  });
});

describe('AlertList', () => {
  it('renders nothing when alerts array is empty', () => {
    const { container } = render(<AlertList alerts={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders multiple alert badges', () => {
    render(<AlertList alerts={[temperatureAlert, windAlert]} />);

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Wind')).toBeInTheDocument();
  });
});
