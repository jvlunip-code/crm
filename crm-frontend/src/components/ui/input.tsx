import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Shared field box used by Input, Textarea and the Select trigger: white
 * field, r10, `border-input` (#87867F, the WCAG 1.4.11 boundary). Focus =
 * ring-coloured border plus the 2px outline recipe. 16px text below `md`
 * (stops iOS zooming on focus), 14px from `md`.
 */
export const fieldBoxBaseClass =
  'w-full min-w-0 rounded-md border border-input bg-card text-foreground transition-colors placeholder:text-foreground-tertiary focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-sunken disabled:text-foreground-disabled aria-invalid:border-destructive';

/** The box plus typed-text sizing (16px below `md`, `type-body` from `md`). */
export const fieldBoxClass = `${fieldBoxBaseClass} text-base md:type-body`;

/** Field heights: sm 32 (dialogs, inline edit), default 40, lg 44 (toolbars, search, login). */
export const fieldSizeClass = {
  sm: 'h-8 px-2.5',
  default: 'h-10 px-3',
  lg: 'h-11 px-3.5',
} as const;

export type FieldSize = keyof typeof fieldSizeClass;

function Input({
  className,
  type,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & { size?: FieldSize }) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        fieldBoxClass,
        fieldSizeClass[size],
        'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:type-label file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
