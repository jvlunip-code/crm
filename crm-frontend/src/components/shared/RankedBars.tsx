import * as React from 'react';

import { cn } from '@/lib/utils';

export interface RankedBarRow {
  key?: string;
  label: React.ReactNode;
  count: number;
  /** Muted text after the count ("38%", "4 200 €"). */
  extra?: React.ReactNode;
}

const COUNT = new Intl.NumberFormat('pt-PT');

/**
 * Ranked horizontal bars (dashboard "Operadoras"): label and printed value on
 * one line, a 10px bar under it (r4, `bg-muted` track, `bg-brand` fill,
 * width = count / max). The value is always printed — clay on the track is
 * below 3:1, so the bar is decoration and stays `aria-hidden`.
 */
export function RankedBars({
  rows,
  max,
  formatCount = (n) => COUNT.format(n),
  empty,
  className,
}: {
  rows: RankedBarRow[];
  /** Scale; defaults to the largest count. */
  max?: number;
  formatCount?: (count: number) => React.ReactNode;
  empty?: React.ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return empty ? <>{empty}</> : null;
  }
  const scale = Math.max(max ?? Math.max(...rows.map((r) => r.count)), 1);

  return (
    <ul data-slot="ranked-bars" className={cn('flex flex-col gap-4.5', className)}>
      {rows.map((row, i) => {
        const pct = Math.min(100, Math.max(0, (row.count / scale) * 100));
        return (
          <li key={row.key ?? i} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 type-body">
              <span className="min-w-0 truncate text-foreground">{row.label}</span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                <span className="font-medium text-foreground">{formatCount(row.count)}</span>
                {row.extra != null && <> · {row.extra}</>}
              </span>
            </div>
            <div aria-hidden className="h-2.5 overflow-hidden rounded-xs bg-muted">
              <div className="h-full rounded-xs bg-brand" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
