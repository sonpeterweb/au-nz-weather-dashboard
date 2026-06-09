'use client';

import { useMemo, useState } from 'react';

import {
  type DashboardGranularity,
  getDefaultVariables,
  getVariableOptions,
  validateDateRange,
} from '@/lib/dashboard-params';
import { PRESETS } from '@/lib/locations';
import { cn } from '@/lib/utils';
import { useDashboardSearchParams } from '@/hooks/useDashboardSearchParams';

interface FilterBarProps {
  selectedCities: string[];
  granularity: DashboardGranularity;
  vars: string[];
  start: string;
  end: string;
}

const cityOptions = Object.entries(PRESETS).map(([id, location]) => ({
  id,
  label: location.label,
}));

export function FilterBar({
  selectedCities,
  granularity,
  vars,
  start,
  end,
}: FilterBarProps) {
  const { updateParams } = useDashboardSearchParams();
  const [dateError, setDateError] = useState<string | null>(null);

  const variableOptions = useMemo(
    () => getVariableOptions(granularity),
    [granularity]
  );

  const handleCityToggle = (cityId: string, checked: boolean) => {
    const nextCities = checked
      ? Array.from(new Set([...selectedCities, cityId]))
      : selectedCities.filter((id) => id !== cityId);

    if (nextCities.length === 0) {
      return;
    }

    updateParams({ city: nextCities });
  };

  const handleGranularityChange = (nextGranularity: DashboardGranularity) => {
    if (nextGranularity === granularity) {
      return;
    }

    updateParams({
      gran: nextGranularity,
      vars: getDefaultVariables(nextGranularity),
    });
  };

  const handleVariableToggle = (variable: string, checked: boolean) => {
    const nextVars = checked
      ? Array.from(new Set([...vars, variable]))
      : vars.filter((id) => id !== variable);

    if (nextVars.length === 0) {
      return;
    }

    updateParams({ vars: nextVars });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const nextStart = field === 'start' ? value : start;
    const nextEnd = field === 'end' ? value : end;
    const validation = validateDateRange(nextStart, nextEnd);

    if (!validation.isValid) {
      setDateError(validation.error ?? 'Invalid date range');
      return;
    }

    setDateError(null);
    updateParams({ start: nextStart, end: nextEnd });
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <fieldset className='space-y-2'>
          <legend className='text-sm font-semibold'>Cities</legend>
          <div className='flex flex-wrap gap-2'>
            {cityOptions.map((city) => {
              const isSelected = selectedCities.includes(city.id);
              return (
                <label
                  key={city.id}
                  className={cn(
                    'label cursor-pointer gap-2 rounded-lg border px-3 py-2',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300'
                  )}
                >
                  <input
                    type='checkbox'
                    className='checkbox checkbox-sm checkbox-primary'
                    checked={isSelected}
                    onChange={(event) =>
                      handleCityToggle(city.id, event.target.checked)
                    }
                  />
                  <span className='label-text text-sm'>{city.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className='space-y-2'>
          <legend className='text-sm font-semibold'>Granularity</legend>
          <select
            className='select select-bordered select-sm w-full'
            value={granularity}
            aria-label='Data granularity'
            onChange={(event) =>
              handleGranularityChange(
                event.target.value as DashboardGranularity
              )
            }
          >
            <option value='hourly'>Hourly</option>
            <option value='daily'>Daily</option>
          </select>
        </fieldset>

        <fieldset className='space-y-2 md:col-span-2 xl:col-span-2'>
          <legend className='text-sm font-semibold'>Variables</legend>
          <div className='flex flex-wrap gap-2'>
            {variableOptions.map((variable) => {
              const isSelected = vars.includes(variable.id);
              return (
                <label
                  key={variable.id}
                  className={cn(
                    'label cursor-pointer gap-2 rounded-lg border px-3 py-2',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300'
                  )}
                >
                  <input
                    type='checkbox'
                    className='checkbox checkbox-sm checkbox-primary'
                    checked={isSelected}
                    onChange={(event) =>
                      handleVariableToggle(variable.id, event.target.checked)
                    }
                  />
                  <span className='label-text text-sm'>{variable.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <label className='form-control w-full'>
          <span className='label-text mb-1 font-semibold'>Start date</span>
          <input
            type='date'
            className='input input-bordered input-sm w-full'
            value={start}
            aria-label='Start date'
            onChange={(event) => handleDateChange('start', event.target.value)}
          />
        </label>
        <label className='form-control w-full'>
          <span className='label-text mb-1 font-semibold'>End date</span>
          <input
            type='date'
            className='input input-bordered input-sm w-full'
            value={end}
            aria-label='End date'
            onChange={(event) => handleDateChange('end', event.target.value)}
          />
        </label>
      </div>

      {dateError && (
        <p className='text-sm text-error' role='alert'>
          {dateError}
        </p>
      )}
    </div>
  );
}
