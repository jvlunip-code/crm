import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Compact page header: the page's single <h1> (display style, 21/28), an
 * optional technical identifier in mono, an optional badge row, a short
 * description, and the page-level actions on the right. Context (breadcrumb)
 * lives in the site header, not here.
 */
interface PageHeaderProps extends Omit<React.ComponentProps<'header'>, 'title'> {
  title: React.ReactNode;
  /** Identifier shown after the title in mono (NIF, nº cliente, date…). */
  identifier?: React.ReactNode;
  /** Badges / status chips rendered next to the title. */
  meta?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
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
      className={cn('border-b border-border bg-background', className)}
      {...props}
    >
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="min-w-0 truncate type-page-title text-foreground">{title}</h1>
            {identifier && <span className="type-mono text-muted-foreground">{identifier}</span>}
            {meta && <div className="flex flex-wrap items-center gap-1.5">{meta}</div>}
          </div>
          {description && (
            <p className="mt-1 max-w-[64ch] type-body text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
