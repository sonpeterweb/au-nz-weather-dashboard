import { cn } from '@/lib/utils';

export type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  title: string;
  message: string;
  variant?: ErrorVariant;
  className?: string;
}

const variantStyles: Record<ErrorVariant, string> = {
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export function ErrorMessage({
  title,
  message,
  variant = 'error',
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn('alert', variantStyles[variant], className)}
      role='alert'
      aria-live='polite'
    >
      <div>
        <h3 className='font-semibold'>{title}</h3>
        <p className='text-sm'>{message}</p>
      </div>
    </div>
  );
}

interface ErrorMessageListProps {
  messages: Array<{
    id: string;
    title: string;
    message: string;
    variant?: ErrorVariant;
  }>;
  className?: string;
}

export function ErrorMessageList({
  messages,
  className,
}: ErrorMessageListProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {messages.map((item) => (
        <ErrorMessage
          key={item.id}
          title={item.title}
          message={item.message}
          variant={item.variant}
        />
      ))}
    </div>
  );
}
