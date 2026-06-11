import { fireEvent, render, screen, within } from '@testing-library/react';

import { DateRangeCalendar } from '@/components/DateRangeCalendar';

function getDayButton(day: string) {
  const calendar = screen.getByLabelText('Date range calendar');
  return within(calendar).getByRole('button', { name: day });
}

describe('DateRangeCalendar', () => {
  it('renders the selected range summary and DaisyUI calendar', () => {
    render(
      <DateRangeCalendar
        start='2025-01-01'
        end='2025-01-07'
        onRangeChange={jest.fn()}
      />
    );

    expect(screen.getByText(/Jan 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 7/i)).toBeInTheDocument();
    expect(screen.getByText(/\(7 days\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Date range calendar')).toBeInTheDocument();
    expect(document.querySelector('.react-day-picker')).toBeInTheDocument();
  });

  it('does not call onRangeChange on the first click', () => {
    const onRangeChange = jest.fn();

    render(
      <DateRangeCalendar
        start='2025-01-01'
        end='2025-01-07'
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.click(getDayButton('2'));

    expect(onRangeChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Jan 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 7/i)).toBeInTheDocument();
    expect(screen.getByText('Select an end date')).toBeInTheDocument();
  });

  it('updates the displayed range immediately after completing a selection', () => {
    const onRangeChange = jest.fn();

    render(
      <DateRangeCalendar
        start='2025-01-01'
        end='2025-01-07'
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.click(getDayButton('2'));
    fireEvent.click(getDayButton('10'));

    expect(onRangeChange).toHaveBeenCalledWith({
      start: '2025-01-02',
      end: '2025-01-10',
    });
    expect(screen.getByText(/Jan 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan 10/i)).toBeInTheDocument();
    expect(screen.getByText(/\(9 days\)/i)).toBeInTheDocument();
  });

  it('reports validation errors for ranges longer than 30 days', () => {
    const onRangeChange = jest.fn();
    const onError = jest.fn();

    render(
      <DateRangeCalendar
        start='2025-01-01'
        end='2025-01-07'
        onRangeChange={onRangeChange}
        onError={onError}
      />
    );

    fireEvent.click(getDayButton('1'));
    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    fireEvent.click(getDayButton('15'));

    expect(onRangeChange).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('30 days'));
  });

  it('starts a new range on the third click after completing one', () => {
    const onRangeChange = jest.fn();

    render(
      <DateRangeCalendar
        start='2025-01-01'
        end='2025-01-07'
        onRangeChange={onRangeChange}
      />
    );

    fireEvent.click(getDayButton('2'));
    fireEvent.click(getDayButton('10'));
    expect(onRangeChange).toHaveBeenCalledTimes(1);

    fireEvent.click(getDayButton('1'));
    expect(screen.getByText('Select an end date')).toBeInTheDocument();
    expect(onRangeChange).toHaveBeenCalledTimes(1);
  });
});
