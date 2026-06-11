import { fireEvent, render, screen, within } from '@testing-library/react';

import { FilterBar } from '@/components/FilterBar';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () =>
    new URLSearchParams(
      'view=summary&city=auckland&gran=hourly&vars=temperature_2m,precipitation,windspeed_10m&start=2025-01-01&end=2025-01-07'
    ),
}));

function getCalendarDay(day: string) {
  const calendar = screen.getByLabelText('Date range calendar');
  return within(calendar).getByRole('button', { name: day });
}

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    selectedCities: ['auckland'],
    granularity: 'hourly' as const,
    vars: ['temperature_2m', 'precipitation', 'windspeed_10m'],
    start: '2025-01-01',
    end: '2025-01-07',
  };

  it('renders AU/NZ city options from presets', () => {
    render(<FilterBar {...defaultProps} />);

    expect(screen.getByText('Auckland, NZ')).toBeInTheDocument();
    expect(screen.getByText('Sydney, AU')).toBeInTheDocument();
    expect(screen.getByText('Wellington, NZ')).toBeInTheDocument();
    expect(screen.getByText('Perth, AU')).toBeInTheDocument();
    expect(screen.getByText('Christchurch, NZ')).toBeInTheDocument();
    expect(screen.getByText('Adelaide, AU')).toBeInTheDocument();
    expect(screen.getByText('New Zealand')).toBeInTheDocument();
    expect(screen.getByText('Australia')).toBeInTheDocument();
    expect(screen.queryByText('Darwin, AU')).not.toBeInTheDocument();
  });

  it('updates city URL param when a city is selected', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Sydney, AU'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('city=auckland%2Csydney'),
      { scroll: false }
    );
  });

  it('resets variables when granularity changes', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Data granularity'), {
      target: { value: 'daily' },
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining(
        'vars=temperature_2m_max%2Ctemperature_2m_min%2Cprecipitation_sum'
      ),
      { scroll: false }
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('gran=daily'),
      { scroll: false }
    );
  });

  it('shows validation error for invalid date ranges', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(getCalendarDay('1'));
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    fireEvent.click(getCalendarDay('15'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /exceeds maximum of 30 days/i
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('updates URL when a valid date range is selected', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(getCalendarDay('2'));
    fireEvent.click(getCalendarDay('10'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('start=2025-01-02'),
      { scroll: false }
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('end=2025-01-10'),
      { scroll: false }
    );
  });

  it('does not allow deselecting the last city', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Auckland, NZ'));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('updates variables in the URL when toggled', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Precipitation'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('vars=temperature_2m%2Cwindspeed_10m'),
      { scroll: false }
    );
  });

  it('resets city selection to Auckland only', () => {
    render(
      <FilterBar
        {...defaultProps}
        selectedCities={['auckland', 'sydney', 'melbourne']}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Reset cities to Auckland only' })
    );

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('city=auckland'),
      { scroll: false }
    );
    expect(mockPush.mock.calls.at(-1)?.[0]).not.toContain('sydney');
  });

  it('disables reset cities when only Auckland is selected', () => {
    render(<FilterBar {...defaultProps} selectedCities={['auckland']} />);

    expect(
      screen.getByRole('button', { name: 'Reset cities to Auckland only' })
    ).toBeDisabled();
  });
});
