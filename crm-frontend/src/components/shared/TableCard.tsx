import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Card around a full-width table (DESIGN.md › Space): white, hairline, r16,
 * clipped corners, the table scrolling sideways inside it (never the page),
 * and a footer slot behind a hairline for pagination (padding 14 20).
 *
 * - `title` / `description` / `action` add a head padded 24 (dashboard
 *   tables); list pages leave them out and the table starts at the top.
 * - `ivoryHead` fills the header row with the Ivory canvas (list pages).
 * - Render `<Table inset>` inside so the first/last cells sit 24px in.
 */
export function TableCard({
  title,
  description,
  action,
  footer,
  ivoryHead = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  ivoryHead?: boolean;
}) {
  const titleId = React.useId();
  const hasHead = Boolean(title || description || action);

  return (
    <section
      data-slot="table-card"
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        hasHead && 'gap-4 pt-6',
        hasHead && !footer && 'pb-2',
        className,
      )}
      {...props}
    >
      {hasHead && (
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-6">
          <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
            {title && (
              <h2 id={titleId} className="type-heading text-foreground">
                {title}
              </h2>
            )}
            {description && <div className="type-body text-muted-foreground">{description}</div>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div
        data-slot="table-card-body"
        className={cn('min-w-0 overflow-x-auto', ivoryHead && '[&_thead]:bg-background')}
      >
        {children}
      </div>
      {footer && (
        <div
          data-slot="table-card-footer"
          className="border-t border-border-subtle px-5 py-3.5"
        >
          {footer}
        </div>
      )}
    </section>
  );
}
