import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Definition list for the customer side cards (DESIGN.md › Space): items 14px
 * apart, one column or a two-column grid (`columns={2}`; span an item with
 * `className="col-span-2"`).
 */
export function DetailList({
  columns = 1,
  className,
  ...props
}: React.ComponentProps<'dl'> & { columns?: 1 | 2 }) {
  return (
    <dl
      className={cn(
        columns === 2 ? 'grid grid-cols-2 gap-x-4 gap-y-3.5' : 'flex flex-col gap-3.5',
        className,
      )}
      {...props}
    />
  );
}

/** One term/value pair: 12px muted `dt` over a 14px `dd`. */
export function DetailItem({
  label,
  srOnlyLabel = false,
  className,
  children,
}: {
  label: React.ReactNode;
  /** Keep the term for screen readers only (the value names itself). */
  srOnlyLabel?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', className)}>
      <dt className={cn('type-caption text-muted-foreground', srOnlyLabel && 'sr-only')}>
        {label}
      </dt>
      <dd className="min-w-0 type-body break-words text-foreground">{children}</dd>
    </div>
  );
}
