import * as React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Toolbar search (DESIGN.md › Space): 44px (`size="lg"`, the default) white
 * field, r10, a 16px tertiary icon 14px in and the text from 40px; an
 * optional clear button (shown when `onClear` is given and there is a value).
 * Pass `aria-label`: the field has no visible label. In dialogs pass
 * `size="sm"` or `"default"`.
 */
export function SearchField({
  className,
  onClear,
  value,
  size = 'lg',
  ...props
}: React.ComponentProps<typeof Input> & { onClear?: () => void }) {
  const hasValue = typeof value === 'string' ? value.length > 0 : !!value;
  const showClear = Boolean(onClear && hasValue);
  return (
    <div className={cn('relative min-w-0', className)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-foreground-tertiary"
      />
      <Input
        type="search"
        value={value}
        size={size}
        className={cn('pl-10 [&::-webkit-search-cancel-button]:hidden', showClear && 'pr-11')}
        {...props}
      />
      {showClear && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          aria-label="Limpar pesquisa"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
        >
          <XIcon aria-hidden />
        </Button>
      )}
    </div>
  );
}
