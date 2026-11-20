import type { Notification, NotificationFlag } from '@/types';
import { formatServiceDate } from '@/lib/utils';

export type RenderedNotification = {
  title: string;
  message: string;
  flag: NotificationFlag;
  href: string;
};

export function renderNotification(n: Notification): RenderedNotification {
  switch (n.subtype) {
    case 'SERVICO_A_TERMINAR': {
      const m = n.metadata;
      return {
        title: `Serviço a terminar — ${m.serviceAcesso}`,
        message: `${m.customerName} — termina ${formatServiceDate(m.serviceDataFim)}`,
        flag: m.flag,
        href: `/customers/${m.customerId}`,
      };
    }
  }
}
