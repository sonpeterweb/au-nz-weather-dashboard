import type { WeatherAlert } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  alert: WeatherAlert;
  className?: string;
}

const severityStyles: Record<WeatherAlert['severity'], string> = {
  danger: 'badge-error',
  warning: 'badge-warning',
};

const typeLabels: Record<WeatherAlert['type'], string> = {
  temperature: 'Temperature',
  precipitation: 'Rainfall',
  wind: 'Wind',
};

export function AlertBadge({ alert, className }: AlertBadgeProps) {
  return (
    <span
      className={cn(
        'badge badge-sm gap-1',
        severityStyles[alert.severity],
        className
      )}
      role='status'
      aria-label={`${typeLabels[alert.type]} alert: ${alert.message}`}
    >
      <span className='font-semibold'>{typeLabels[alert.type]}</span>
      <span>{alert.message}</span>
    </span>
  );
}

interface AlertListProps {
  alerts: WeatherAlert[];
  className?: string;
}

export function AlertList({ alerts, className }: AlertListProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role='list'>
      {alerts.map((alert) => (
        <AlertBadge key={`${alert.type}-${alert.value}`} alert={alert} />
      ))}
    </div>
  );
}
