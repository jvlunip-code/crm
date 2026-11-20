import type { BadgeTone } from '@/components/ui/badge';
import type { NotificationFlag } from '@/types';

/**
 * How close a service is to its end date, following the one urgency rule
 * (DESIGN.md › Status): expired = error, up to 3 months = warning, further
 * out = neutral. Urgency is carried by the label and the pill tone, never by
 * a coloured edge.
 */
export const FLAG: Record<NotificationFlag, { label: string; tone: BadgeTone }> = {
  red: { label: 'Expirado', tone: 'error' },
  orange: { label: 'Até 3 meses', tone: 'warning' },
  yellow: { label: 'Até 6 meses', tone: 'neutral' },
  green: { label: 'Até 9 meses', tone: 'neutral' },
};
