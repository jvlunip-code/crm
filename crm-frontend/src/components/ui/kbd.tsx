import * as React from 'react';

import { cn } from '@/lib/utils';

/** Keyboard key tile — 20px, 1px radius (extracted shortcut-key). */
function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border bg-muted px-1 type-kbd text-foreground-secondary',
        className,
      )}
      {...props}
    />
  );
}

export { Kbd };
