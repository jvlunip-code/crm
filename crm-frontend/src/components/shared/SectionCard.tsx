import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Titled panel (DESIGN.md › Space): white, hairline, r16, padding 24, no
 * shadow. Head = serif `<h2>` (`type-heading` 22, or `type-heading-sm` 20 with
 * `size="side"` for side-column cards) over an optional muted description,
 * with `action` on the right (a link, a count pill, a headline figure).
 *
 * `flush` is for tables and lists that run edge to edge: the card pads 24 0 8
 * and only the head and footer keep the 24px side padding — give the table
 * `<Table inset>` so its first/last cells line up with the title.
 * `footer` sits at the bottom behind a hairline (totals, "Ver todos").
 */
export function SectionCard({
  title,
  description,
  action,
  footer,
  size = 'default',
  flush = false,
  headingLevel = 2,
  className,
  bodyClassName,
  children,
  ...props
}: Omit<React.ComponentProps<'section'>, 'title'> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'default' | 'side';
  flush?: boolean;
  headingLevel?: 2 | 3;
  bodyClassName?: string;
}) {
  const titleId = React.useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const hasHead = Boolean(title || description || action);
  const pad = flush ? 'px-6' : '';

  return (
    <section
      data-slot="section-card"
      data-size={size}
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground',
        flush ? 'gap-4 pt-6 pb-2' : 'gap-4 p-6',
        className,
      )}
      {...props}
    >
      {hasHead && (
        <div
          data-slot="section-card-header"
          className={cn('flex flex-wrap items-start justify-between gap-x-4 gap-y-2', pad)}
        >
          <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
            {title && (
              <Heading
                id={titleId}
                className={cn(
                  'text-foreground',
                  size === 'side' ? 'type-heading-sm' : 'type-heading',
                )}
              >
                {title}
              </Heading>
            )}
            {description && <div className="type-body text-muted-foreground">{description}</div>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      <div data-slot="section-card-body" className={cn('flex min-w-0 flex-1 flex-col', bodyClassName)}>
        {children}
      </div>
      {footer && (
        <div
          data-slot="section-card-footer"
          className={cn(
            'mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4',
            flush && 'px-6 pb-4',
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}
