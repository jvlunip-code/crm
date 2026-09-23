import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Buttons: dark primary (the observed source CTA), light secondary with a
 * structural border that strengthens on hover, quiet ghost. Radius 2px, focus
 * = 2px violet ring with 2px offset. `accent` is the reserved yellow-green
 * CTA — at most one per screen and only where a product decision names it.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm border border-transparent type-control whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary',
        outline:
          'border-border bg-card text-foreground-secondary hover:border-border-strong hover:text-foreground active:bg-accent aria-expanded:border-border-strong aria-expanded:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-border active:bg-secondary aria-expanded:bg-border',
        ghost:
          'text-foreground-secondary hover:bg-accent hover:text-foreground active:bg-muted aria-expanded:bg-accent aria-expanded:text-foreground',
        destructive:
          'border-destructive/40 bg-card text-destructive hover:border-destructive hover:bg-destructive/10 focus-visible:ring-destructive',
        accent: 'border-border-strong bg-accent-cta text-foreground hover:bg-accent-cta/80',
        link: 'h-auto rounded-xs p-0 text-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 gap-1.5 px-3',
        xs: "h-6 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-9 gap-2 px-3.5 text-sm',
        icon: 'size-8',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
