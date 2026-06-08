import type { ReactNode } from 'react';

type ChartProps = {
  children?: ReactNode;
  data?: unknown[];
};

type SeriesProps = {
  name?: string;
  dataKey?: string;
  stroke?: string;
  fill?: string;
};

export const rechartsMock = {
  ResponsiveContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid='responsive-container'>{children}</div>
  ),
  LineChart: ({ children, data }: ChartProps) => (
    <div data-testid='line-chart' data-points={data?.length ?? 0}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: ChartProps) => (
    <div data-testid='bar-chart' data-points={data?.length ?? 0}>
      {children}
    </div>
  ),
  AreaChart: ({ children, data }: ChartProps) => (
    <div data-testid='area-chart' data-points={data?.length ?? 0}>
      {children}
    </div>
  ),
  CartesianGrid: () => <div data-testid='cartesian-grid' />,
  XAxis: () => <div data-testid='x-axis' />,
  YAxis: () => <div data-testid='y-axis' />,
  Tooltip: () => <div data-testid='tooltip' />,
  Legend: () => <div data-testid='legend' />,
  Line: ({ name, dataKey }: SeriesProps) => (
    <div data-testid='line-series' data-name={name} data-key={dataKey} />
  ),
  Bar: ({ name, dataKey }: SeriesProps) => (
    <div data-testid='bar-series' data-name={name} data-key={dataKey} />
  ),
  Area: ({ name, dataKey }: SeriesProps) => (
    <div data-testid='area-series' data-name={name} data-key={dataKey} />
  ),
};
