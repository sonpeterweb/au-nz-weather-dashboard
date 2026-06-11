import {
  buildDashboardSearchParams,
  getDefaultVariables,
  getVariableOptions,
  parseDashboardParams,
  validateDateRange,
} from './dashboard-params';

describe('dashboard-params', () => {
  describe('getDefaultVariables', () => {
    it('returns hourly defaults', () => {
      expect(getDefaultVariables('hourly')).toEqual([
        'temperature_2m',
        'precipitation',
        'windspeed_10m',
      ]);
    });

    it('returns daily defaults', () => {
      expect(getDefaultVariables('daily')).toEqual([
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
      ]);
    });
  });

  describe('getVariableOptions', () => {
    it('returns hourly variable options', () => {
      expect(getVariableOptions('hourly').map((item) => item.id)).toEqual([
        'temperature_2m',
        'precipitation',
        'windspeed_10m',
      ]);
    });
  });

  describe('validateDateRange', () => {
    it('rejects ranges longer than 30 days', () => {
      const result = validateDateRange('2025-01-01', '2025-02-15');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('30 days');
    });

    it('accepts valid ranges', () => {
      const result = validateDateRange('2025-01-01', '2025-01-10');
      expect(result.isValid).toBe(true);
    });
  });

  describe('parseDashboardParams', () => {
    it('separates valid and invalid cities', () => {
      const parsed = parseDashboardParams({
        city: 'auckland,invalid-city,sydney',
      });

      expect(parsed.validCities).toEqual(['auckland', 'sydney']);
      expect(parsed.invalidCities).toEqual(['invalid-city']);
    });

    it('warns on invalid view and defaults to summary', () => {
      const parsed = parseDashboardParams({ view: 'admin' });

      expect(parsed.view).toBe('summary');
      expect(parsed.paramWarnings[0]).toContain('Invalid view');
    });

    it('filters unsupported variables for granularity', () => {
      const parsed = parseDashboardParams({
        gran: 'hourly',
        vars: 'temperature_2m,precipitation_sum',
      });

      expect(parsed.vars).toEqual(['temperature_2m']);
      expect(parsed.invalidVars).toEqual(['precipitation_sum']);
    });

    it('returns date errors for invalid ranges', () => {
      const parsed = parseDashboardParams({
        start: '2025-01-01',
        end: '2025-03-01',
      });

      expect(parsed.dateError).toContain('30 days');
    });

    it('warns on invalid granularity and defaults to hourly', () => {
      const parsed = parseDashboardParams({ gran: 'weekly' });

      expect(parsed.gran).toBe('hourly');
      expect(parsed.paramWarnings[0]).toContain('Invalid granularity');
    });

    it('falls back to default variables when all requested vars are invalid', () => {
      const parsed = parseDashboardParams({
        gran: 'hourly',
        vars: 'precipitation_sum,temperature_2m_max',
      });

      expect(parsed.vars).toEqual([
        'temperature_2m',
        'precipitation',
        'windspeed_10m',
      ]);
      expect(parsed.paramWarnings).toContain(
        'No valid variables selected. Using default variables.'
      );
    });
  });

  describe('buildDashboardSearchParams', () => {
    it('updates comma-separated params', () => {
      const params = buildDashboardSearchParams(
        new URLSearchParams('view=summary&city=auckland'),
        { city: ['auckland', 'sydney'], view: 'charts' }
      );

      expect(params.get('view')).toBe('charts');
      expect(params.get('city')).toBe('auckland,sydney');
    });

    it('removes params when value is empty', () => {
      const params = buildDashboardSearchParams(
        new URLSearchParams('view=summary&start=2025-01-01'),
        { start: undefined }
      );

      expect(params.get('start')).toBeNull();
      expect(params.get('view')).toBe('summary');
    });
  });
});
