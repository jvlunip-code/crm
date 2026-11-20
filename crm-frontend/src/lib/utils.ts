import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `Há ${minutes}m`;
  if (hours < 24) return `Há ${hours}h`;
  if (days < 7) return `Há ${days}d`;
  return formatDate(date);
}

const COUNT = new Intl.NumberFormat('pt-PT');

/** pt-PT grouped integer ("2418", "12 345"). */
export function formatCount(n: number): string {
  return COUNT.format(n);
}

const MONTH_SHORT_UTC = new Intl.DateTimeFormat('pt-PT', { month: 'short', timeZone: 'UTC' });

/** "YYYY-MM-DD" → "28 nov. 2026", read as a calendar day (no timezone shift). */
export function formatDayMonthYear(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return `${d} ${MONTH_SHORT_UTC.format(date)} ${y}`;
}

const FILE_SIZE = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1 });

/** Bytes → "1,5 MB" (pt-PT decimals). */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${FILE_SIZE.format(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  read: 'Lido',
  unread: 'Não lido',
  paused: 'Pausado',
  cancelled: 'Cancelado',
  pending: 'Pendente',
};

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status;
}

export function formatNif(value: string | null | undefined): string {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
}

/** "YYYY-MM-DD" (DRF DateField) → "DD/MM/YYYY", without timezone shifts. */
export function formatServiceDate(value: string | null | undefined): string {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : value;
}
