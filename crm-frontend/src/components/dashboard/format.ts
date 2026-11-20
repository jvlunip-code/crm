/**
 * Dashboard formatting helpers (pt-PT, Europe/Lisbon). Dates from the API are
 * plain "YYYY-MM-DD" strings, so they are read as UTC calendar days and never
 * shifted by the browser's time zone.
 */

const PERCENT = new Intl.NumberFormat('pt-PT', { style: 'percent', maximumFractionDigits: 0 });
const MONTH_SHORT = new Intl.DateTimeFormat('pt-PT', { month: 'short', timeZone: 'UTC' });
const MONTH_LONG = new Intl.DateTimeFormat('pt-PT', { month: 'long', timeZone: 'UTC' });
const MONTH_YEAR = new Intl.DateTimeFormat('pt-PT', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const TODAY_LONG = new Intl.DateTimeFormat('pt-PT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Lisbon',
});
const LISBON_HOUR = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: 'Europe/Lisbon',
});

/** Share as a whole percentage ("38%"); 0 when there is no total. */
export function formatShare(part: number, total: number): string {
  return PERCENT.format(total > 0 ? part / total : 0);
}

function isoToUtcDate(iso: string): Date | null {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m) return null;
  return new Date(Date.UTC(y, m - 1, d || 1));
}

/** "nov." for "2026-11-01". */
export function formatMonthShort(iso: string): string {
  const date = isoToUtcDate(iso);
  return date ? MONTH_SHORT.format(date) : iso;
}

/** "novembro" for "2026-11-01". */
export function formatMonthLong(iso: string): string {
  const date = isoToUtcDate(iso);
  return date ? MONTH_LONG.format(date) : iso;
}

/** "novembro de 2026" for "2026-11-01". */
export function formatMonthYear(iso: string): string {
  const date = isoToUtcDate(iso);
  return date ? MONTH_YEAR.format(date) : iso;
}

/** "Sexta-feira, 20 de novembro" (today, in Lisbon). */
export function formatTodayLong(now: Date = new Date()): string {
  const text = TODAY_LONG.format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "Bom dia" before 12h, "Boa tarde" before 20h, then "Boa noite" (Lisbon time). */
export function greetingFor(now: Date = new Date()): string {
  const hour = Number(LISBON_HOUR.format(now));
  if (hour < 12) return 'Bom dia';
  if (hour < 20) return 'Boa tarde';
  return 'Boa noite';
}
