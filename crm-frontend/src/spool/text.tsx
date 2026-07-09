import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Typography components ported from spool's text.tsx. Each maps 1:1 to a
 * spool fontStyle (see .spool-* classes in index.css): Relative Pro for
 * headings, Suisse Intl for copy and labels.
 */

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;
type SpanProps = React.HTMLAttributes<HTMLSpanElement>;
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function heading(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', spoolClass: string) {
  const Component = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, ...props }, ref) =>
      React.createElement(tag, { ref, className: cn(spoolClass, className), ...props }),
  );
  Component.displayName = tag.toUpperCase();
  return Component;
}

export const H1 = heading('h1', 'spool-h1');
export const H2 = heading('h2', 'spool-h2');
export const H3 = heading('h3', 'spool-h3');
export const H4 = heading('h4', 'spool-h4');
export const H5 = heading('h5', 'spool-h5');
export const H6 = heading('h6', 'spool-h6');

export const Copy = React.forwardRef<HTMLSpanElement, SpanProps>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn('spool-copy', className)} {...props} />
));
Copy.displayName = 'Copy';

export const CopySmall = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('spool-copy-small', className)} {...props} />
  ),
);
CopySmall.displayName = 'CopySmall';

export const CopyExtraSmall = React.forwardRef<HTMLSpanElement, SpanProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('spool-copy-xs', className)} {...props} />
  ),
);
CopyExtraSmall.displayName = 'CopyExtraSmall';

export const LabelText = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('spool-label', className)} {...props} />
  ),
);
LabelText.displayName = 'LabelText';

export const LabelTextLarge = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('spool-label-lg', className)} {...props} />
  ),
);
LabelTextLarge.displayName = 'LabelTextLarge';

export const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <code ref={ref} className={cn('spool-code rounded-sm px-1 py-0.5', className)} {...props} />
  ),
);
Code.displayName = 'Code';
