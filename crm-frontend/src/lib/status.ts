import type { BadgeTone } from '@/components/ui/badge';

/** Dot colour per status tone (StatusBadge, StatStrip). */
export const STATUS_DOT: Record<BadgeTone, string> = {
  neutral: 'bg-status-neutral',
  info: 'bg-status-info',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  note: 'bg-status-note',
};

/**
 * Domain status → tone. Pair with `getStatusLabel()`: the label carries the
 * meaning, the tone only reinforces it.
 */
const STATUS_TONES: Record<string, BadgeTone> = {
  active: 'success',
  inactive: 'neutral',
  read: 'neutral',
  unread: 'info',
  paused: 'warning',
  cancelled: 'error',
  pending: 'info',
};

export function getStatusTone(status: string): BadgeTone {
  return STATUS_TONES[status] ?? 'neutral';
}
