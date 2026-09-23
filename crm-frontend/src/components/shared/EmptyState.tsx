import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Empty / error / "nothing selected" messaging. `framed` adds the structural
 * border with corner markers — reserved for page-level emptiness, never for
 * a slot inside a table or a side panel.
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
      className={cn(
        'relative flex flex-col items-center justify-center gap-1.5 text-center',
        size === 'default' ? 'px-6 py-12' : 'px-4 py-8',
        framed && 'border border-border bg-card',
        className,
      )}
      {...props}
    >
      {framed && <CornerMarkers />}
      {icon && (
        <span
          aria-hidden
          className={cn(
            'mb-1 flex size-8 items-center justify-center rounded-sm border border-border bg-muted/60 [&>svg]:size-4',
            tone === 'error'
              ? 'border-status-error/40 bg-status-error/10 text-status-error'
              : 'text-muted-foreground',
          )}
        >
          {icon}
        </span>
      )}
      {title && <div className="type-section text-foreground">{title}</div>}
      {description && <p className="max-w-[44ch] type-body text-muted-foreground">{description}</p>}
      {children}
      {action && <div className="mt-2 flex items-center gap-2">{action}</div>}
    </div>
  );
}

/** Four 8px L-marks inset −1px, the source card decoration. */
export function CornerMarkers({ className }: { className?: string }) {
  const base = 'pointer-events-none absolute size-2 border-border-strong';
  return (
    <span aria-hidden className={cn('contents', className)}>
      <span className={cn(base, '-top-px -left-px border-t border-l')} />
      <span className={cn(base, '-top-px -right-px border-t border-r')} />
      <span className={cn(base, '-bottom-px -left-px border-b border-l')} />
      <span className={cn(base, '-right-px -bottom-px border-r border-b')} />
    </span>
  );
}
