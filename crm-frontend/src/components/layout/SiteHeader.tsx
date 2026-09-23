import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationsBell } from '@/components/layout/NotificationsBell';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { breadcrumbsFor } from '@/lib/breadcrumbs';

/** Application header, as tall as the sidebar header: sidebar toggle, breadcrumb trail, notifications. */
export function SiteHeader() {
  const { pathname } = useLocation();
  const crumbs = breadcrumbsFor(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b border-border bg-background">
      <div className="flex w-full min-w-0 items-center gap-2 px-3 lg:px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            {crumbs.map((crumb, i) => (
              <Fragment key={`${crumb.label}-${i}`}>
                {i > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
                <BreadcrumbItem className={i < crumbs.length - 1 ? 'hidden sm:inline-flex' : ''}>
                  {crumb.to ? (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-1">
          <NotificationsBell />
        </div>
      </div>
    </header>
  );
}
