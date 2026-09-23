import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/** Thin determinate bar (2px). `tone` picks the fill; default is primary. */
function Progress({
  className,
  value,
  tone = 'primary',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: 'primary' | 'info' | 'success' | 'warning' | 'error';
}) {
  const fill = {
    primary: 'bg-primary',
    info: 'bg-status-info',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
  }[tone];
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn('relative h-0.5 w-full overflow-hidden rounded-full bg-muted', className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 transition-transform', fill)}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
