import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Empty / error / "nothing selected" messaging: a 40px icon disc on the
 * sunken surface, a short title and one line of help. Inside a table or a
 * card slot use it bare (sans 14/500 title); `framed` makes it a page-level
 * panel (white, hairline, r16, serif 20 title) — never inside another card.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  size = 'default',
  framed = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: 'neutral' | 'error';
  size?: 'default' | 'sm';
  framed?: boolean;
}) {
  return (
    <div
      data-slot="empty-state"
      data-tone={tone}
      // Load failures are announced (also when a retry fails again).
      role={tone === 'error' ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 text-center',
        size === 'default' ? 'px-6 py-12' : 'px-4 py-8',
        framed && 'rounded-xl border border-border bg-card',
        className,
      )}
      {...props}
    >
      {icon && (
        <span
          aria-hidden
          className={cn(
            'mb-1.5 flex size-10 items-center justify-center rounded-full [&>svg]:size-4.5 [&>svg]:stroke-[1.75]',
            tone === 'error'
              ? 'bg-status-error-bg text-status-error-fg'
              : 'border border-border bg-surface-sunken text-foreground-secondary',
          )}
        >
          {icon}
        </span>
      )}
      {title && (
        <div className={cn('text-foreground', framed ? 'type-heading-sm' : 'type-section')}>
          {title}
        </div>
      )}
      {description && <p className="max-w-[44ch] type-body text-muted-foreground">{description}</p>}
      {children}
      {action && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
