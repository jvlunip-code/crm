import * as React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Titled panel for the customer detail tabs: a header row (title, optional
 * description and action) over flush content — a definition list, a table or
 * a list. Separation by borders, never nested cards.
 */
export function DetailPanel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="min-w-0">
          <h2 className="type-section text-foreground">{title}</h2>
          {description && <p className="type-caption text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {children}
    </Card>
  );
}

/** One term/value pair of a definition list: eyebrow term, dense value. */
export function DetailRow({
  label,
  className,
  children,
}: {
  label: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('px-4 py-2.5', className)}>
      <dt className="type-eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 type-dense break-words text-foreground">{children}</dd>
    </div>
  );
}
