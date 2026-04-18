import type { NotificationFlag } from '@/types'

export const flagDotClass: Record<NotificationFlag, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
}

export const flagBadgeClass: Record<NotificationFlag, string> = {
  red: 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400',
  yellow: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-300',
  green: 'bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400',
}

export const flagLabel: Record<NotificationFlag, string> = {
  red: 'Expirado',
  orange: 'Até 3 meses',
  yellow: 'Até 6 meses',
  green: 'Até 9 meses',
}
