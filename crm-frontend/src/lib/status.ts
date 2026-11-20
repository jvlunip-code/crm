import type { BadgeTone } from '@/components/ui/badge';

/**
 * Status tones (DESIGN.md › Status is a pill). Pick a tone here, never a
 * colour in the call site: `StatusBadge` turns it into the tinted pill
 * (`status-{tone}-bg` / `-fg`) with its dot (`status-{tone}`).
 */

/** Dot colour per status tone, for a bare dot outside a pill (legends, rows). */
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

/* ------------------------------------------------------------------------ */
/* Service end urgency: one rule everywhere (dashboard, services, detail).   */
/* ------------------------------------------------------------------------ */

/** Days at or under which an end date needs attention (same window as `?ending=90`). */
export const URGENT_WITHIN_DAYS = 90;

const LISBON_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Lisbon',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Today's date in Lisbon as "YYYY-MM-DD" (the backend's notion of "today"). */
export function todayInLisbon(now: Date = new Date()): string {
  return LISBON_DATE.format(now);
}

function isoDayNumber(isoDate: string): number | null {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/**
 * Whole days from today (Lisbon) to a "YYYY-MM-DD" date: negative once it has
 * passed, 0 on the day itself. `null` for a missing or malformed date.
 */
export function daysUntil(isoDate: string | null | undefined, today = todayInLisbon()): number | null {
  if (!isoDate) return null;
  const end = isoDayNumber(isoDate);
  const start = isoDayNumber(today);
  if (end === null || start === null) return null;
  return Math.round(end - start);
}

export interface ServiceEndUrgency {
  /** Days left; negative when the service has ended. */
  days: number;
  /** "Terminado" · "Hoje" · "Falta 1 dia" · "Faltam N dias". */
  label: string;
  /** expired = error, ≤ 90 days = warning, otherwise neutral. */
  tone: Extract<BadgeTone, 'error' | 'warning' | 'neutral'>;
  /** True when ended or within the 90-day window. */
  urgent: boolean;
}

/**
 * Urgency of a service end date (DESIGN.md › Status): expired = error,
 * ≤ 90 days = warning, otherwise neutral, always with text. `null` when the
 * service has no end date.
 */
export function serviceEndUrgency(
  dataFim: string | null | undefined,
  today = todayInLisbon(),
): ServiceEndUrgency | null {
  const days = daysUntil(dataFim, today);
  if (days === null) return null;
  if (days < 0) return { days, label: 'Terminado', tone: 'error', urgent: true };
  const label = days === 0 ? 'Hoje' : days === 1 ? 'Falta 1 dia' : `Faltam ${days} dias`;
  const urgent = days <= URGENT_WITHIN_DAYS;
  return { days, label, tone: urgent ? 'warning' : 'neutral', urgent };
}
