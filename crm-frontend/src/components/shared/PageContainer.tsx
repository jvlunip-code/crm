import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * The page column (DESIGN.md › Space): responsive page padding
 * (20 16 32 below 768px · 28 24 40 to 1023px · 32 40 48 from 1024px) around
 * a left-aligned 1200px content column whose sections sit 24px apart.
 * Every routed page renders its content inside one of these.
 */
export function PageContainer({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-container"
      className="w-full px-4 pt-5 pb-8 md:px-6 md:pt-7 md:pb-10 lg:px-10 lg:pt-8 lg:pb-12"
      {...props}
    >
      <div className={cn('flex w-full max-w-300 min-w-0 flex-col gap-6', className)}>
        {children}
      </div>
    </div>
  );
}
