import * as React from 'react';

import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface ListTab<V extends string> {
  value: V;
  label: string;
  /** Count chip after the label; omit (or `null` while loading) to hide it. */
  count?: number | null;
}

const COUNT = new Intl.NumberFormat('pt-PT');

/**
 * Underlined list filter tabs with count chips (DESIGN.md › Components),
 * built on Radix Tabs for roving focus and tab/tabpanel semantics.
 *
 * Controlled: keep `value` in the URL (`useSearchParams`) so other pages can
 * deep-link a tab. `children` (the table) is rendered inside the active
 * tabpanel. Each tab is announced as "Ativos, 412" rather than "Ativos412".
 * `size="card"` is the 48px variant for tabs inside a card.
 */
export function ListTabs<V extends string>({
  value,
  onValueChange,
  tabs,
  size = 'default',
  'aria-label': ariaLabel,
  className,
  listClassName,
  children,
}: {
  value: V;
  onValueChange: (value: V) => void;
  tabs: ListTab<V>[];
  size?: 'default' | 'card';
  'aria-label'?: string;
  className?: string;
  listClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as V)}
      className={cn('min-w-0 gap-4', className)}
    >
      <TabsList
        variant="line"
        size={size}
        aria-label={ariaLabel}
        className={cn(
          'w-full max-w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none]',
          listClassName,
        )}
      >
        {tabs.map((tab) => {
          const count = tab.count == null ? null : COUNT.format(tab.count);
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              aria-label={count === null ? undefined : `${tab.label}, ${count}`}
              // The list scrolls sideways and would clip an outer outline.
              className="focus-visible:-outline-offset-2"
            >
              {tab.label}
              {count !== null && <TabsCount aria-hidden>{count}</TabsCount>}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children !== undefined && (
        <TabsContent value={value} className="min-w-0">
          {children}
        </TabsContent>
      )}
    </Tabs>
  );
}
