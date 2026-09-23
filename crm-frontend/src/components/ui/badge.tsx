import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Badges are 20px, 2px-radius chips. `tone` renders a status: the hue lives on
 * the border and a 10% tint, the label stays primary text (the extracted
 * success/warning hues fail AA as text). `variant` covers the non-status chips.
 */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'note';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm border px-1.5 text-xs leading-4 font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-muted text-foreground-secondary',
        secondary: 'border-transparent bg-muted text-foreground-secondary',
        outline: 'border-border bg-transparent text-foreground-secondary',
        inverse: 'border-transparent bg-primary text-primary-foreground',
        destructive: 'border-status-error/40 bg-status-error/10 text-foreground',
        ghost: 'border-transparent bg-transparent text-foreground-secondary hover:bg-muted',
        link: 'border-transparent text-link underline-offset-4 hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'border-border bg-muted/60 text-foreground-secondary',
  info: 'border-status-info/45 bg-status-info/10 text-foreground',
  success: 'border-status-success/45 bg-status-success/10 text-foreground',
  warning: 'border-status-warning/55 bg-status-warning/10 text-foreground',
  error: 'border-status-error/45 bg-status-error/10 text-foreground',
  note: 'border-status-note bg-status-note/25 text-foreground',
};

function Badge({
  className,
  variant = 'default',
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    tone?: BadgeTone;
  }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      className={cn(badgeVariants({ variant }), tone && TONE_CLASS[tone], className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
