import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type SortHeadState<F extends string> = { field: F; dir: 'asc' | 'desc' } | null;

/** Column header that cycles its field's sort: asc → desc → off. */
export function SortableHead<F extends string>({
  field,
  sort,
  onSort,
  className,
  children,
}: {
  field: F;
  sort: SortHeadState<F>;
  onSort: (field: F) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const dir = sort?.field === field ? sort.dir : null;
  return (
    <TableHead
      className={className}
      aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}
    >
      <SortHeaderButton dir={dir} onClick={() => onSort(field)}>
        {children}
      </SortHeaderButton>
    </TableHead>
  );
}

/**
 * The clickable label + direction arrow inside a sortable header (12/500 like
 * every `th`; the arrow is quiet until the column is sorted). Use it on
 * its own where the `<th>` is already rendered (TanStack headers in `ClientTable`).
 */
export function SortHeaderButton({
  dir,
  onClick,
  children,
}: {
  dir: 'asc' | 'desc' | null | false;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      className="-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-xs px-1 type-eyebrow transition-colors hover:text-foreground"
    >
      {children}
      <Icon
        aria-hidden
        className={cn('size-3.5', dir ? 'text-foreground' : 'text-foreground-disabled')}
      />
    </button>
  );
}
