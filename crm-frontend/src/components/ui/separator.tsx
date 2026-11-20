import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

/** Hairline rule in `border-subtle` (dashed: `border-strong`). */
function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant = 'solid',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  variant?: 'solid' | 'dashed';
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-variant={variant}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0',
        variant === 'solid' &&
          'border-border-subtle data-[orientation=horizontal]:h-0 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=vertical]:h-full data-[orientation=vertical]:w-0 data-[orientation=vertical]:border-l',
        variant === 'dashed' &&
          'border-border-strong data-[orientation=horizontal]:w-full data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dashed data-[orientation=vertical]:h-full data-[orientation=vertical]:border-l data-[orientation=vertical]:border-dashed',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
