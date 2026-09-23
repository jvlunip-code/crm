import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="field-group" className={cn('flex flex-col gap-4', className)} {...props} />
  );
}

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="field" className={cn('group flex flex-col gap-1.5', className)} {...props} />
  );
}

/** The required marker sits beside the <label>, not inside it, so the
 *  accessible name (and getByLabelText) stays exactly the label text. */
function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  const label = (
    <Label data-slot="field-label" className={cn(className)} {...props}>
      {children}
    </Label>
  );
  if (!required) return label;
  return (
    <div className="flex items-center gap-1">
      {label}
      <span aria-hidden className="type-label text-destructive">
        *
      </span>
    </div>
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('type-caption text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, children, ...props }: React.ComponentProps<'p'>) {
  if (!children) return null;
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('type-caption text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
