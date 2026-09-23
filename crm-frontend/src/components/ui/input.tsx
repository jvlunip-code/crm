import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Shared field box used by Input, Textarea and the Select trigger: white field
 * on the warm canvas, structural border that strengthens on hover, violet
 * border + soft ring on focus. 16px on touch widths (prevents iOS zoom).
 */
export const fieldBoxClass =
  'w-full min-w-0 rounded-sm border border-input bg-input-bg text-base leading-5 text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-border-strong focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-muted disabled:text-foreground-disabled aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:type-dense';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldBoxClass,
        'h-8 px-2.5 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
