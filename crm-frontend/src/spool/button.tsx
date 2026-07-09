import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/*
 * Button styled after spool's BaseButton feels:
 *   default     → primary (midBlue fill, white text, darker on hover/active)
 *   secondary   → transparent fill + grey border, grey100 hover
 *   outline     → alias of spool secondary (kept for shadcn API compat)
 *   ghost       → tertiary (midBlueDark text, midBlueLight hover, filled when pressed)
 *   destructive → feedbackError fill
 * Heights follow spool ButtonSize: regular 40px, small 32px. Radius 4px.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive-hover active:bg-destructive-hover',
        success: 'bg-success text-success-foreground hover:bg-success/90 active:bg-success/80',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 active:bg-warning/80',
        outline:
          'border border-input bg-transparent text-foreground hover:bg-muted active:bg-muted disabled:border-transparent',
        secondary:
          'border border-input bg-transparent text-foreground hover:bg-muted active:bg-muted disabled:border-transparent',
        ghost:
          'text-primary-hover hover:bg-accent-hover hover:text-primary-hover active:bg-primary-active active:text-primary-foreground disabled:bg-transparent',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary-hover disabled:bg-transparent',
      },
      size: {
        default: 'h-10 min-w-[72px] px-4 py-2',
        sm: 'h-8 min-w-[72px] rounded-md px-3',
        lg: 'h-11 min-w-[72px] rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
