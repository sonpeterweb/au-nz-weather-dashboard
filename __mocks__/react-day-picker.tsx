import React from 'react';

function createDay(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { date: new Date(year, month - 1, day) };
}

interface DayPickerProps {
  className?: string;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  onDayClick?: (date: Date, ...args: unknown[]) => void;
}

export function DayPicker({
  className,
  onMonthChange,
  onDayClick,
}: DayPickerProps) {
  const days = [
    { label: '1', day: createDay('2025-01-01') },
    { label: '2', day: createDay('2025-01-02') },
    { label: '10', day: createDay('2025-01-10') },
    { label: '15', day: createDay('2025-02-15') },
  ];

  return (
    <div className={className} data-testid='mock-day-picker'>
      <button
        type='button'
        aria-label='Next month'
        onClick={() => onMonthChange?.(new Date(2025, 1, 1))}
      >
        Next month
      </button>
      {days.map(({ label, day }) => (
        <button
          key={label}
          type='button'
          onClick={() => onDayClick?.(day.date, {}, {})}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
