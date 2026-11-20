import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: React.ReactNode;
  /** Route to link to; omit for the current page (the last crumb). */
  to?: string;
}

/**
 * In-page breadcrumb for detail screens only (DESIGN.md › Shell): the first
 * crumb is a link with a back arrow ("← Clientes"), "/" separators, and the
 * current page — with the record's real name — in foreground text.
 */
export function PageBreadcrumb({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <Breadcrumb aria-label="Localização" className={className}>
      <BreadcrumbList className="gap-2 type-nav text-muted-foreground sm:gap-2">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && <BreadcrumbSeparator className="text-foreground-tertiary">/</BreadcrumbSeparator>}
              <BreadcrumbItem className="min-w-0">
                {crumb.to && !last ? (
                  <BreadcrumbLink
                    asChild
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      i === 0 && 'font-medium text-link hover:text-link-hover',
                    )}
                  >
                    <Link to={crumb.to}>
                      {i === 0 && <ArrowLeft aria-hidden className="size-4" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
