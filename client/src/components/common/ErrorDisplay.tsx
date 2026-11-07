import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}: ErrorDisplayProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-lg font-semibold text-foreground">Error</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
