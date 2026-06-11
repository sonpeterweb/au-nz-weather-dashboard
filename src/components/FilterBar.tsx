'use client';

import { useMemo, useState } from 'react';

import {
  type DashboardGranularity,
  getDefaultVariables,
  getVariableOptions,
} from '@/lib/dashboard-params';
import { AU_CITY_IDS, NZ_CITY_IDS, PRESETS } from '@/lib/locations';
import { cn } from '@/lib/utils';
import { useDashboardSearchParams } from '@/hooks/useDashboardSearchParams';

import { DateRangeCalendar } from '@/components/DateRangeCalendar';

interface FilterBarProps {
  selectedCities: string[];
  granularity: DashboardGranularity;
  vars: string[];
  start: string;
  end: string;
}

const cityGroups = [
  { title: 'Australia', ids: AU_CITY_IDS },
  { title: 'New Zealand', ids: NZ_CITY_IDS },
] as const;

function CityCheckbox({
  cityId,
  isSelected,
  onToggle,
}: {
  cityId: string;
  isSelected: boolean;
  onToggle: (cityId: string, checked: boolean) => void;
}) {
  const location = PRESETS[cityId];

  return (
    <label
      className={cn(
        'label cursor-pointer gap-2 rounded-lg border px-3 py-2',
        isSelected ? 'border-primary bg-primary/10' : 'border-base-300'
      )}
    >
      <input
        type='checkbox'
        className='checkbox checkbox-sm checkbox-primary'
        checked={isSelected}
        onChange={(event) => onToggle(cityId, event.target.checked)}
      />
      <span className='label-text text-sm'>{location.label}</span>
    </label>
  );
}

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

  const handleResetCities = () => {
    updateParams({ city: ['auckland'] });
  };

  const isDefaultCitySelection =
    selectedCities.length === 1 && selectedCities[0] === 'auckland';

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

  const handleRangeChange = (range: { start: string; end: string }) => {
    setDateError(null);
    updateParams({ start: range.start, end: range.end });
  };

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start'>
      <div className='space-y-4'>
        <fieldset className='space-y-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <legend className='text-sm font-semibold'>Cities</legend>
            <button
              type='button'
              className='btn btn-ghost btn-xs'
              aria-label='Reset cities to Auckland only'
              disabled={isDefaultCitySelection}
              onClick={handleResetCities}
            >
              Reset cities
            </button>
          </div>
          {cityGroups.map((group) => (
            <div key={group.title} className='space-y-2'>
              <p className='text-xs font-medium uppercase tracking-wide text-base-content/70'>
                {group.title}
              </p>
              <div className='flex flex-wrap gap-2'>
                {group.ids.map((cityId) => (
                  <CityCheckbox
                    key={cityId}
                    cityId={cityId}
                    isSelected={selectedCities.includes(cityId)}
                    onToggle={handleCityToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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

          <fieldset className='space-y-2'>
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
      </div>

      <div className='xl:sticky xl:top-4 xl:w-[min(100%,20rem)]'>
        <DateRangeCalendar
          start={start}
          end={end}
          onRangeChange={handleRangeChange}
          onError={setDateError}
        />
        {dateError && (
          <p className='mt-2 text-sm text-error' role='alert'>
            {dateError}
          </p>
        )}
      </div>
    </div>
  );
}
