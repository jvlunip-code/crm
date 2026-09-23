import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Filter/search row above a table or list: filters on the left, a count
 * caption, and the primary action on the right. Wraps below `sm`.
 */
export function TableToolbar({
  children,
  count,
  actions,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  count?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div>
      {count != null && (
        <span className="type-caption whitespace-nowrap text-muted-foreground tabular-nums">
          {count}
        </span>
      )}
      {actions && <div className="flex shrink-0 items-center gap-2 sm:ml-auto">{actions}</div>}
    </div>
  );
}
