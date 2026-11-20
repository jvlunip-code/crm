import * as React from 'react';
import { LoaderIcon } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * The one status renderer (DESIGN.md › Status is a pill). Domain maps
 * (`lib/status.ts`, `lib/notifications/flag-style.ts`, the Events action map)
 * resolve a label and a `tone`; this draws the tinted pill with dark ink and
 * a 6px dot in the tone's hue. The label is always present, never colour
 * alone. Pass `icon` for outcome pills (replaces the dot) or `spinning` for
 * in-flight states.
 */
export function StatusBadge({
  tone,
  children,
  spinning = false,
  dot = true,
  icon,
  className,
  ...props
}: React.ComponentProps<'span'> & {
  tone: BadgeTone;
  /** Show a spinner instead of the dot (in-flight states). */
  spinning?: boolean;
  dot?: boolean;
  /** 12px icon instead of the dot (outcomes: done, failed…). Decorative. */
  icon?: React.ReactNode;
}) {
  const lead = spinning ? (
    <LoaderIcon className="animate-spin" aria-hidden />
  ) : icon ? (
    <span aria-hidden className="contents">
      {icon}
    </span>
  ) : null;

  return (
    <Badge
      tone={tone}
      dot={dot && !lead}
      className={cn('shrink-0 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:stroke-[2.5]', className)}
      {...props}
    >
      {lead}
      {children}
    </Badge>
  );
}
