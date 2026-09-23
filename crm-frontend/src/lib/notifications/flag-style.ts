import type { BadgeTone } from '@/components/ui/badge';
import type { NotificationFlag } from '@/types';

/**
 * How close a service is to its end date. Urgency is carried by the label
 * (and a matching left rule / badge tone), never by colour alone.
 */
export const FLAG: Record<NotificationFlag, { label: string; tone: BadgeTone; rule: string }> = {
  red: { label: 'Expirado', tone: 'error', rule: 'bg-status-error' },
  orange: { label: 'Até 3 meses', tone: 'warning', rule: 'bg-status-warning' },
  yellow: { label: 'Até 6 meses', tone: 'neutral', rule: 'bg-status-warning/50' },
  green: { label: 'Até 9 meses', tone: 'neutral', rule: 'bg-border' },
};
