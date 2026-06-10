import { render, screen } from '@testing-library/react';

import {
  ChartCard,
  formatChartTooltipValue,
  MultiSeriesTooltip,
} from '@/components/charts/chart-shared';

describe('chart-shared', () => {
  it('renders chart card with title and unit', () => {
    render(
      <ChartCard title='Temperature' unit='°C'>
        <div>Chart body</div>
      </ChartCard>
    );

    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Unit: °C')).toBeInTheDocument();
    expect(screen.getByText('Chart body')).toBeInTheDocument();
  });

  it('formats tooltip values', () => {
    expect(formatChartTooltipValue(22.456, '°C')).toBe('22.5 °C');
  });

  it('renders multi-series tooltip when active', () => {
    render(
      <MultiSeriesTooltip
        active
        label='2025-01-21T12:00'
        unit='°C'
        gran='hourly'
        payload={[{ name: 'Auckland', value: 22, color: '#2563eb' }]}
      />
    );

    expect(screen.getByText('Auckland:')).toBeInTheDocument();
    expect(screen.getByText('22.0 °C')).toBeInTheDocument();
  });

  it('returns null when tooltip is inactive', () => {
    const { container } = render(
      <MultiSeriesTooltip active={false} unit='mm' gran='daily' />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders tooltip without a label', () => {
    render(
      <MultiSeriesTooltip
        active
        unit='mm'
        gran='daily'
        payload={[{ name: 'Rainfall', value: 5 }]}
      />
    );

    expect(screen.getByText('Rainfall:')).toBeInTheDocument();
  });
});
