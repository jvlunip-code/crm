import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

/**
 * Hearth buttons (DESIGN.md → Actions). Primary = Slate fill with Ivory text;
 * secondary/outline = white with the strong hairline, hover `bg-accent`;
 * ghost = transparent, hover `bg-accent`; destructive = outlined red ink,
 * hover the error tint; `destructive-solid` only for the confirm button of a
 * delete dialog. Text buttons are r10, small icon buttons r8. Focus = the
 * 2px outline recipe (no box-shadow rings). Icon-only sizes get a 44px hit
 * area on coarse pointers.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent type-control whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        secondary:
          'border-border-strong bg-card text-foreground hover:bg-accent aria-expanded:bg-accent',
        outline:
          'border-border-strong bg-card text-foreground hover:bg-accent aria-expanded:bg-accent',
        ghost:
          'text-foreground-secondary hover:bg-accent hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground',
        destructive:
          'border-destructive bg-card text-destructive-ink hover:bg-status-error-bg aria-expanded:bg-status-error-bg',
        'destructive-solid':
          'bg-destructive text-destructive-foreground hover:bg-destructive-ink',
        link: 'text-link hover:text-link-hover',
      },
      size: {
        default: 'h-10 gap-2 px-4',
        xs: "h-7 gap-1.5 px-2.5 type-label [&_svg:not([class*='size-'])]:size-3.5",
        sm: 'h-8 gap-1.5 px-3',
        lg: 'h-11 gap-2 px-5',
        icon: "relative size-10 pointer-coarse:after:absolute pointer-coarse:after:-inset-0.5 pointer-coarse:after:content-['']",
        'icon-xs':
          "relative size-7 rounded-sm pointer-coarse:after:absolute pointer-coarse:after:-inset-2 pointer-coarse:after:content-[''] [&_svg:not([class*='size-'])]:size-3.5",
        'icon-sm':
          "relative size-9 rounded-sm pointer-coarse:after:absolute pointer-coarse:after:-inset-1 pointer-coarse:after:content-['']",
        'icon-lg': 'size-11',
      },
    },
    compoundVariants: [
      // A link reads as text: no box, no padding, whatever the size.
      { variant: 'link', class: 'h-auto rounded-xs border-0 px-0 py-0' },
    ],
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
