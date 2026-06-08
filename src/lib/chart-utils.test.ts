import type { DailyResp, HourlyResp } from '@/lib/schema';

import { buildChartPanels, formatAxisTick, toDailySeries } from './chart-utils';

const hourlyData: HourlyResp = {
  hourly: {
    time: ['2025-01-21T00:00', '2025-01-21T01:00'],
    temperature_2m: [20, 22],
    precipitation: [1, 2],
    windspeed_10m: [10, 12],
  },
};

const dailyData: DailyResp = {
  daily: {
    time: ['2025-01-21', '2025-01-22'],
    temperature_2m_max: [30, 32],
    temperature_2m_min: [18, 20],
    precipitation_sum: [5, 8],
    windspeed_10m_max: [15, 18],
  },
};

describe('chart-utils', () => {
  describe('toDailySeries', () => {
    it('transforms daily data into chart-friendly format', () => {
      const result = toDailySeries(dailyData, 'temperature_2m_max');

      expect(result).toEqual([
        { time: '2025-01-21', temperature_2m_max: 30 },
        { time: '2025-01-22', temperature_2m_max: 32 },
      ]);
    });
  });

  describe('formatAxisTick', () => {
    it('formats hourly ticks as time', () => {
      expect(formatAxisTick('2025-01-21T14:30:00', 'hourly')).toContain(
        '14:30'
      );
    });

    it('formats daily ticks as medium date', () => {
      expect(formatAxisTick('2025-01-21', 'daily')).toMatch(/Jan/);
    });
  });

  describe('buildChartPanels', () => {
    it('returns empty array when no cities or vars', () => {
      expect(buildChartPanels([], 'hourly', [])).toEqual([]);
    });

    it('groups temperature variables into a line chart panel', () => {
      const panels = buildChartPanels(
        [{ id: 'auckland', label: 'Auckland', data: dailyData }],
        'daily',
        ['temperature_2m_max', 'temperature_2m_min']
      );

      expect(panels).toHaveLength(1);
      expect(panels[0].type).toBe('line');
      expect(panels[0].series).toHaveLength(2);
      expect(panels[0].data).toHaveLength(2);
    });

    it('creates separate panels per chart type', () => {
      const panels = buildChartPanels(
        [{ id: 'auckland', label: 'Auckland', data: hourlyData }],
        'hourly',
        ['temperature_2m', 'precipitation', 'windspeed_10m']
      );

      expect(panels.map((panel) => panel.type)).toEqual([
        'line',
        'bar',
        'area',
      ]);
    });

    it('merges multiple cities into shared chart data', () => {
      const panels = buildChartPanels(
        [
          { id: 'auckland', label: 'Auckland', data: hourlyData },
          { id: 'sydney', label: 'Sydney', data: hourlyData },
        ],
        'hourly',
        ['temperature_2m']
      );

      expect(panels[0].series).toHaveLength(2);
      expect(panels[0].data[0]).toHaveProperty('auckland__temperature_2m', 20);
      expect(panels[0].data[0]).toHaveProperty('sydney__temperature_2m', 20);
    });

    it('builds large datasets quickly', () => {
      const largeHourly: HourlyResp = {
        hourly: {
          time: Array.from(
            { length: 720 },
            (_, i) => `2025-01-01T${String(i % 24).padStart(2, '0')}:00`
          ),
          temperature_2m: Array.from({ length: 720 }, (_, i) => 15 + (i % 10)),
        },
      };

      const start = performance.now();
      const panels = buildChartPanels(
        [
          { id: 'auckland', label: 'Auckland', data: largeHourly },
          { id: 'sydney', label: 'Sydney', data: largeHourly },
          { id: 'melbourne', label: 'Melbourne', data: largeHourly },
        ],
        'hourly',
        ['temperature_2m', 'precipitation', 'windspeed_10m']
      );
      const elapsed = performance.now() - start;

      expect(panels).toHaveLength(3);
      expect(elapsed).toBeLessThan(100);
    });
  });
});
