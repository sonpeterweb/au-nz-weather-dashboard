'use client';

import { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { MAX_DATE_RANGE_DAYS, validateDateRange } from '@/lib/dashboard-params';
import { cn, formatDate } from '@/lib/utils';

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function countInclusiveDays(start: string, end: string): number {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  return (
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDayInRange(day: Date, from: Date, to: Date): boolean {
  const time = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate()
  ).getTime();
  const startTime = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate()
  ).getTime();
  const endTime = new Date(
    to.getFullYear(),
    to.getMonth(),
    to.getDate()
  ).getTime();
  return time >= startTime && time <= endTime;
}

type SelectionPhase = 'start' | 'end';

interface DateRangeCalendarProps {
  start: string;
  end: string;
  onRangeChange: (range: { start: string; end: string }) => void;
  onError?: (error: string | null) => void;
  className?: string;
}

export function DateRangeCalendar({
  start,
  end,
  onRangeChange,
  onError,
  className,
}: DateRangeCalendarProps) {
  const [phase, setPhase] = useState<SelectionPhase>('start');
  const [anchorDate, setAnchorDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(() => parseIsoDate(start));
  const [displayRange, setDisplayRange] = useState({ start, end });

  const displayFrom = parseIsoDate(displayRange.start);
  const displayTo = parseIsoDate(displayRange.end);

  useEffect(() => {
    setDisplayRange({ start, end });
  }, [start, end]);

  useEffect(() => {
    if (phase === 'start') {
      setMonth(parseIsoDate(displayRange.start));
    }
  }, [displayRange.start, phase]);

  const handleDayClick = (clickedDate: Date) => {
    onError?.(null);

    if (phase === 'start') {
      setAnchorDate(clickedDate);
      setPhase('end');
      return;
    }

    const fromDate = anchorDate ?? clickedDate;
    let rangeStart = fromDate;
    let rangeEnd = clickedDate;

    if (rangeEnd < rangeStart) {
      [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
    }

    const nextStart = toIsoDate(rangeStart);
    const nextEnd = toIsoDate(rangeEnd);
    const validation = validateDateRange(nextStart, nextEnd);

    if (!validation.isValid) {
      onError?.(validation.error ?? 'Invalid date range');
      setAnchorDate(clickedDate);
      setPhase('end');
      return;
    }

    setDisplayRange({ start: nextStart, end: nextEnd });
    onRangeChange({ start: nextStart, end: nextEnd });
    setAnchorDate(null);
    setPhase('start');
  };

  const selectedDayCount = countInclusiveDays(
    displayRange.start,
    displayRange.end
  );

  return (
    <fieldset className={cn('space-y-3', className)}>
      <legend className='text-sm font-semibold'>Date range</legend>
      <p className='text-sm text-base-content/70'>
        {formatDate(displayRange.start, 'medium')} –{' '}
        {formatDate(displayRange.end, 'medium')}
        <span className='ml-2 text-xs'>
          ({selectedDayCount} {selectedDayCount === 1 ? 'day' : 'days'})
        </span>
      </p>
      <p className='text-xs text-base-content/60'>
        {phase === 'end'
          ? 'Select an end date'
          : `Click a start date, then an end date (max ${MAX_DATE_RANGE_DAYS} days)`}
      </p>
      <div
        className='rounded-box border border-base-300 bg-base-100 p-3 shadow-sm inline-block'
        aria-label='Date range calendar'
      >
        <DayPicker
          month={month}
          onMonthChange={setMonth}
          onDayClick={handleDayClick}
          className='react-day-picker'
          weekStartsOn={1}
          numerals='latn'
          modifiers={{
            range_start: (date) => {
              if (phase === 'end' && anchorDate) {
                return isSameDay(date, anchorDate);
              }

              return isSameDay(date, displayFrom);
            },
            range_end: (date) => {
              if (phase === 'end') {
                return false;
              }

              return isSameDay(date, displayTo);
            },
            range_middle: (date) => {
              if (phase === 'end') {
                return false;
              }

              return (
                isDayInRange(date, displayFrom, displayTo) &&
                !isSameDay(date, displayFrom) &&
                !isSameDay(date, displayTo)
              );
            },
          }}
          modifiersClassNames={{
            range_start: 'rdp-range_start',
            range_end: 'rdp-range_end',
            range_middle: 'rdp-range_middle',
            selected: 'rdp-selected',
          }}
        />
      </div>
    </fieldset>
  );
}
