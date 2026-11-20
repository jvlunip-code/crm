'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Tabs (Radix: roving focus + tabpanel semantics).
 * - `variant="line"` is the Hearth tab bar: hairline rule, 14px labels
 *   (muted → foreground on hover, foreground 500 when active) and a 2px Slate
 *   underline. `size="default"` is 44px (page), `size="card"` 48px (inside a
 *   card). Put counts in `<TabsCount>`.
 * - `variant="default"` is a segmented control on `bg-muted`.
 */
function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-2 data-horizontal:flex-col', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'justify-center gap-0.5 rounded-md bg-muted p-1',
        line: 'justify-start gap-1 border-b border-border bg-transparent',
      },
      size: {
        default: '',
        card: '',
      },
    },
    compoundVariants: [
      { variant: 'default', className: 'h-10' },
      { variant: 'line', size: 'default', className: 'h-11' },
      { variant: 'line', size: 'card', className: 'h-12' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function TabsList({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm border border-transparent px-3 type-nav whitespace-nowrap text-muted-foreground transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-active:font-medium data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // segmented (default): the active tab lifts to the panel surface
        'group-data-[variant=default]/tabs-list:data-active:border-border group-data-[variant=default]/tabs-list:data-active:bg-card',
        // line: tabs keep their width; the active one gets a 2px Slate underline
        // laid over the list's hairline rule
        'group-data-[variant=line]/tabs-list:flex-none after:absolute after:inset-x-0 after:-bottom-[0.5px] after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

/** Count chip inside a tab label: 12px on `bg-muted`, 2px 8px, fully rounded. */
function TabsCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="tabs-count"
      className={cn(
        'inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-2 py-0.5 type-caption font-normal text-muted-foreground tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 focus-visible:outline-offset-[-2px]', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsCount, TabsContent, tabsListVariants };
