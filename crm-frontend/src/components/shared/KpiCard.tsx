import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * KPI tile (DESIGN.md › Space): white, hairline, r16, padding 20; a muted
 * 14px label, a serif tabular value (`size="lg"` 34 on the dashboard,
 * `size="md"` 28 on detail pages) and an optional 13px detail line. Express
 * tone inside `detail` (e.g. `<strong className="font-medium
 * text-status-error-fg">`), never with a coloured edge. Show only real
 * figures: no invented deltas.
 *
 * With `to` the whole tile is a link; its accessible name is the visible
 * text (label, value, detail) unless `linkLabel` is given.
 */
export function KpiCard({
  label,
  value,
  detail,
  size = 'lg',
  to,
  linkLabel,
  loading = false,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  size?: 'lg' | 'md';
  to?: string;
  linkLabel?: string;
  loading?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 type-body text-muted-foreground">{label}</span>
        {to && (
          <ArrowUpRight
            aria-hidden
            className="size-4 shrink-0 text-foreground-tertiary transition-colors group-hover/kpi:text-foreground"
          />
        )}
      </div>
      <div
        className={cn(
          'min-w-0 text-foreground tabular-nums',
          size === 'lg' ? 'type-metric' : 'type-title',
        )}
      >
        {loading ? (
          <Skeleton className={cn('my-1 w-16', size === 'lg' ? 'h-8' : 'h-7')} />
        ) : (
          value
        )}
      </div>
      {detail && !loading && (
        <div className="type-dense text-muted-foreground tabular-nums">{detail}</div>
      )}
    </>
  );

  const base = cn(
    'group/kpi flex min-w-0 flex-col gap-1.5 rounded-xl border border-border bg-card p-5 text-card-foreground',
    className,
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={linkLabel}
        aria-busy={loading || undefined}
        data-slot="kpi-card"
        className={cn(base, 'transition-colors hover:border-border-strong hover:bg-background')}
      >
        {body}
      </Link>
    );
  }

  return (
    <div data-slot="kpi-card" aria-busy={loading || undefined} className={base}>
      {body}
    </div>
  );
}

/** KPI row: auto-fit columns (min 220px; 200px for `size="md"`), 16px gap. */
export function KpiGrid({
  size = 'lg',
  className,
  ...props
}: React.ComponentProps<'div'> & { size?: 'lg' | 'md' }) {
  return (
    <div
      data-slot="kpi-grid"
      className={cn(
        'grid gap-4',
        size === 'lg'
          ? 'grid-cols-[repeat(auto-fit,minmax(min(100%,13.75rem),1fr))]'
          : 'grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))]',
        className,
      )}
      {...props}
    />
  );
}
