import type { Notification, NotificationFlag } from '@/types'

export type RenderedNotification = {
  title: string
  message: string
  flag: NotificationFlag
  href: string
}

function formatDmy(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

export function renderNotification(n: Notification): RenderedNotification {
  switch (n.subtype) {
    case 'SERVICO_A_TERMINAR': {
      const m = n.metadata
      return {
        title: `Serviço a terminar — ${m.serviceAcesso}`,
        message: `${m.customerName} — termina ${formatDmy(m.serviceDataFim)}`,
        flag: m.flag,
        href: `/customers/${m.customerId}`,
      }
    }
  }
}
