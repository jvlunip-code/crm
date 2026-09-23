import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import type { BadgeTone } from '@/components/ui/badge';
import { STATUS_DOT } from '@/lib/status';
import { cn } from '@/lib/utils';

export interface StatStripItem {
  key: string;
  label: React.ReactNode;
  value: number | string;
  /** Status tone: draws the matching dot before the label. */
  tone?: BadgeTone;
  /** Quiet second line under the number. */
  hint?: React.ReactNode;
}

/**
 * A compact health board: big tabular numbers with eyebrow labels, side by
 * side and separated by fine rules — no cards. Two columns below `sm`.
 */
export function StatStrip({
  items,
  loading = false,
  className,
  ...props
}: React.ComponentProps<'dl'> & {
  items: StatStripItem[];
  loading?: boolean;
}) {
  return (
    <dl
      data-slot="stat-strip"
      className={cn(
        'grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-0 sm:divide-x sm:divide-border',
        className,
      )}
      {...props}
      // The skeletons are aria-hidden, so without this the board reads as a
      // list of labels with no values instead of one that is still loading.
      aria-busy={loading}
    >
      {items.map((item) => (
        <div
          key={item.key}
          data-test={`stat-${item.key}`}
          className="flex min-w-0 flex-col gap-0.5 sm:px-6 sm:first:pl-0 sm:last:pr-0"
        >
          <dt className="flex items-center gap-1.5 type-eyebrow text-muted-foreground">
            {item.tone && (
              <span
                aria-hidden
                className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[item.tone])}
              />
            )}
            <span className="truncate">{item.label}</span>
          </dt>
          <dd className="type-metric text-foreground">
            {loading ? <Skeleton className="my-1 h-5 w-10" /> : item.value}
          </dd>
          {item.hint && !loading && (
            <dd className="type-caption text-muted-foreground">{item.hint}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}
