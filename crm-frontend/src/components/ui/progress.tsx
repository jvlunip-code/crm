import * as React from 'react';
import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Determinate bar: `bg-muted` track, r4. `tone` picks the fill (default:
 * brand Clay); `size` is `xs` 2px (inline upload rows), `default` 6px,
 * `lg` 10px (ranked bars).
 */
function Progress({
  className,
  value,
  tone = 'brand',
  size = 'default',
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: 'brand' | 'primary' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'default' | 'lg';
}) {
  const fill = {
    brand: 'bg-brand',
    primary: 'bg-primary',
    info: 'bg-status-info',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
  }[tone];
  const height = { xs: 'h-0.5', default: 'h-1.5', lg: 'h-2.5' }[size];
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-size={size}
      className={cn('relative w-full overflow-hidden rounded-xs bg-muted', height, className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn('h-full w-full flex-1 rounded-xs transition-transform', fill)}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
