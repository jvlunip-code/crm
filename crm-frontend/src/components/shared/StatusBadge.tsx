import { LoaderIcon } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { STATUS_DOT } from '@/lib/status';
import { cn } from '@/lib/utils';

/**
 * The one status renderer. Domain maps (customer/service status in
 * `lib/status.ts`, notification flags…) resolve their label and a
 * `tone`; this component turns that into a chip whose hue sits on the border,
 * tint and dot while the label stays primary text (never colour alone).
 */
export function StatusBadge({
  tone,
  children,
  spinning = false,
  dot = true,
  className,
  ...props
}: React.ComponentProps<'span'> & {
  tone: BadgeTone;
  /** Show a spinner instead of the dot (in-flight states). */
  spinning?: boolean;
  dot?: boolean;
}) {
  return (
    <Badge tone={tone} className={cn('shrink-0', className)} {...props}>
      {spinning ? (
        <LoaderIcon className="animate-spin text-status-info" aria-hidden />
      ) : dot ? (
        <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[tone])} />
      ) : null}
      {children}
    </Badge>
  );
}
