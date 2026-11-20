import * as React from 'react';

import { cn } from '@/lib/utils';
import { fieldBoxClass } from '@/components/ui/input';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBoxClass, 'min-h-20 resize-y px-3 py-2.5', className)}
      {...props}
    />
  );
}

export { Textarea };
