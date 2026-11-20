import * as React from 'react';

import { cn } from '@/lib/utils';

/** Tracks whether an element's content is wider than its box. */
function useHorizontalOverflow<E extends HTMLElement>() {
  const [node, setNode] = React.useState<E | null>(null);
  const [overflows, setOverflows] = React.useState(false);

  React.useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') return;
    const measure = () => setOverflows(node.scrollWidth > node.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, [node]);

  return [setNode, overflows] as const;
}

/**
 * Data table (DESIGN.md › Space): 14px tabular cells at 12px padding, header
 * labels 12/500 muted with no fill over a hairline rule, row dividers in
 * `border-subtle`, row hover on the Ivory canvas. Wide tables scroll inside
 * the container, never the page.
 *
 * Edge inset: inside a card whose padding is removed (`<Card className="py-0">`
 * or a flush table card), pass `inset` so the first and last cell of every
 * row get 24px instead of 12px and line up with the card's content edge.
 * It is applied as `[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-6` on
 * the `<table>`; reuse that className pattern for a custom inset.
 *
 * While the table is wider than its container, the scroller becomes a
 * focusable region (named by `scrollLabel`) so keyboard users can scroll it
 * with the arrow keys; it is not a tab stop otherwise.
 */
function Table({
  className,
  inset = false,
  scrollLabel = 'Tabela',
  ...props
}: React.ComponentProps<'table'> & { inset?: boolean; scrollLabel?: string }) {
  const [setScroller, overflows] = useHorizontalOverflow<HTMLDivElement>();
  return (
    <div
      ref={setScroller}
      data-slot="table-container"
      {...(overflows && { tabIndex: 0, role: 'region', 'aria-label': scrollLabel })}
      className="relative w-full overflow-x-auto focus-visible:-outline-offset-2"
    >
      <table
        data-slot="table"
        data-inset={inset || undefined}
        className={cn(
          'w-full caption-bottom type-body tabular-nums',
          inset && '[&_tr>*:first-child]:pl-6 [&_tr>*:last-child]:pr-6',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t border-border font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border-subtle transition-colors hover:bg-background has-aria-expanded:bg-background data-[state=selected]:bg-selection',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'p-3 text-left align-middle type-eyebrow whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-3 type-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
