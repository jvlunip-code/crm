import * as React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Search input with a leading icon and an optional clear button (shown when
 * `onClear` is given and there is a value). Pass `aria-label` — the field has
 * no visible label.
 */
export function SearchField({
  className,
  onClear,
  value,
  ...props
}: React.ComponentProps<typeof Input> & { onClear?: () => void }) {
  const hasValue = typeof value === 'string' ? value.length > 0 : !!value;
  return (
    <div className={cn('relative min-w-0', className)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        className={cn(
          'pl-8 [&::-webkit-search-cancel-button]:hidden',
          onClear && hasValue && 'pr-8',
        )}
        {...props}
      />
      {onClear && hasValue && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Limpar pesquisa"
          className="absolute top-1/2 right-1 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-xs text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
