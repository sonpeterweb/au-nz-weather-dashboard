import { fireEvent, render, screen } from '@testing-library/react';

import { FilterBar } from '@/components/FilterBar';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
  useSearchParams: () =>
    new URLSearchParams(
      'role=manager&city=auckland&gran=hourly&vars=temperature_2m,precipitation,windspeed_10m&start=2025-01-01&end=2025-01-07'
    ),
}));

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

    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2025-03-01' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      /exceeds maximum of 30 days/i
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('updates URL when a valid date range is selected', () => {
    render(<FilterBar {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('End date'), {
      target: { value: '2025-01-10' },
    });

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
});
