import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Pill (DESIGN.md › Status is a pill): fully rounded, 3px 10px, 12/16 500,
 * no border. `tone` renders a status as a tinted background with dark ink
 * (`status-{tone}-bg` / `-fg`); pass `dot` for the 6px hue dot. `tone="chip"`
 * is the categorical chip (operadora, tipo): no status, no dot. `variant`
 * covers the remaining non-status pills.
 */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'note';
export type BadgeChipTone = BadgeTone | 'chip';

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-2.5 py-0.75 type-eyebrow whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3! [&>svg]:stroke-[2.5]',
  {
    variants: {
      variant: {
        default: 'bg-chip text-chip-foreground',
        secondary: 'bg-chip text-chip-foreground',
        outline: 'border border-border-strong bg-transparent text-foreground-secondary',
        inverse: 'bg-primary text-primary-foreground',
        destructive: 'bg-status-error-bg text-status-error-fg',
        ghost: 'bg-transparent text-foreground-secondary hover:bg-muted',
        link: 'text-link hover:text-link-hover',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const TONE_CLASS: Record<BadgeChipTone, string> = {
  neutral: 'border-0 bg-status-neutral-bg text-status-neutral-fg',
  info: 'border-0 bg-status-info-bg text-status-info-fg',
  success: 'border-0 bg-status-success-bg text-status-success-fg',
  warning: 'border-0 bg-status-warning-bg text-status-warning-fg',
  error: 'border-0 bg-status-error-bg text-status-error-fg',
  note: 'border-0 bg-status-note-bg text-status-note-fg',
  chip: 'border-0 bg-chip text-chip-foreground',
};

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-status-neutral',
  info: 'bg-status-info',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  note: 'bg-status-note',
};

function Badge({
  className,
  variant = 'default',
  tone,
  dot = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    tone?: BadgeChipTone;
    /** Leading 6px dot in the tone's hue (ignored for `chip` and with `asChild`). */
    dot?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'span';
  const showDot = dot && !asChild && tone !== undefined && tone !== 'chip';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-tone={tone}
      className={cn(badgeVariants({ variant }), tone && TONE_CLASS[tone], className)}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden
          data-slot="badge-dot"
          className={cn('size-1.5 shrink-0 rounded-full', DOT_CLASS[tone as BadgeTone])}
        />
      )}
      {children}
    </Comp>
  );
}

export { Badge, badgeVariants };
