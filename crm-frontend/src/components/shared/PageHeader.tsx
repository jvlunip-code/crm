import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Page header (DESIGN.md › Shell): an optional 13px eyebrow (e.g. the date),
 * the page's single serif `<h1>`, an optional 15px muted subline, and the
 * page actions on the right (they wrap below the title on narrow screens).
 * No rule, no fill: it sits in the `PageContainer` column.
 */
interface PageHeaderProps extends Omit<React.ComponentProps<'header'>, 'title'> {
  title: React.ReactNode;
  /** Small line above the title (dashboard date…). */
  eyebrow?: React.ReactNode;
  /** Short identifier after the title (tabular sans, muted). */
  identifier?: React.ReactNode;
  /** Pills next to the title (status, "Dados de demonstração"…). */
  meta?: React.ReactNode;
  /** Subline under the title (`type-lead`, muted). */
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  eyebrow,
  identifier,
  meta,
  description,
  actions,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex flex-wrap items-end justify-between gap-4', className)}
      {...props}
    >
      <div className="flex min-w-0 grow basis-72 flex-col gap-1.5">
        {eyebrow && <p className="type-dense text-muted-foreground">{eyebrow}</p>}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <h1 className="min-w-0 type-display break-words text-foreground">{title}</h1>
          {identifier && (
            <span className="type-body text-muted-foreground tabular-nums">{identifier}</span>
          )}
          {meta && <div className="flex flex-wrap items-center gap-1.5">{meta}</div>}
        </div>
        {description && (
          <p className="max-w-[64ch] type-lead text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex max-w-full min-w-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
