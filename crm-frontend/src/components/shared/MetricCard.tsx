import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * KPI summary: eyebrow label + icon, display-size value, caption footer.
 * `tone="warning"` marks an attention-worthy metric with a 2px left rule and
 * a warning-coloured icon — the value and label stay primary text.
 */
export function MetricCard({
  label,
  value,
  icon,
  footer,
  action,
  tone = 'neutral',
  className,
  ...props
}: React.ComponentProps<'div'> & {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'neutral' | 'warning' | 'error' | 'success';
}) {
  return (
    <div
      data-slot="metric-card"
      data-tone={tone}
      className={cn(
        'flex flex-col gap-2 rounded-sm border border-border bg-card px-4 py-3',
        tone === 'warning' && 'border-l-2 border-l-status-warning',
        tone === 'error' && 'border-l-2 border-l-status-error',
        tone === 'success' && 'border-l-2 border-l-status-success',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 type-eyebrow text-muted-foreground">
          {icon && (
            <span
              aria-hidden
              className={cn(
                'shrink-0 [&>svg]:size-3.5',
                tone === 'warning' && 'text-status-warning',
                tone === 'error' && 'text-status-error',
                tone === 'success' && 'text-status-success',
              )}
            >
              {icon}
            </span>
          )}
          <span className="truncate">{label}</span>
        </div>
        {action}
      </div>
      <div className="type-metric text-foreground">{value}</div>
      {footer && <div className="type-caption text-muted-foreground">{footer}</div>}
    </div>
  );
}
