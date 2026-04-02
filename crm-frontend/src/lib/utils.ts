import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return `Há ${minutes}m`
  if (hours < 24) return `Há ${hours}h`
  if (days < 7) return `Há ${days}d`
  return formatDate(date)
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export const statusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  read: 'Lido',
  unread: 'Não lido',
  paused: 'Pausado',
  cancelled: 'Cancelado',
  pending: 'Pendente',
}

export function getStatusLabel(status: string): string {
  return statusLabels[status] || status
}

export function formatNif(value: string | null | undefined): string {
  if (!value) return '—'
  const digits = value.replace(/\D/g, '')
  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}
