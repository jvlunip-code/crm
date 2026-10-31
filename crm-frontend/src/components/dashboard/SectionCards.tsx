import { Bell, CalendarClock, Package, Users } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useUnreadCount } from '@/hooks/use-notifications';
import { formatCurrency } from '@/lib/utils';

/** KPI row: only figures the loaded data supports — no invented trends. */
export function SectionCards() {
  const { data: summary } = useDashboardSummary();
  // Kept on its own query so notification mutations update it immediately.
  const { data: unreadNotifications = 0 } = useUnreadCount();

  const endingSoon = summary?.ending.within90 ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<Users />}
        label="Clientes"
        value={summary?.customers.total ?? '—'}
        footer={summary ? `${summary.customers.active} ativos` : undefined}
      />
      <MetricCard
        icon={<Package />}
        label="Serviços ativos"
        value={summary?.services.active ?? '—'}
        footer={
          summary
            ? `de ${summary.services.total} · ${formatCurrency(summary.services.activeValue)}`
            : undefined
        }
      />
      <MetricCard
        icon={<CalendarClock />}
        label="A terminar em 90 dias"
        value={summary ? endingSoon : '—'}
        footer={summary ? `${summary.ending.expired} já terminados` : undefined}
        tone={endingSoon > 0 ? 'warning' : 'neutral'}
      />
      <MetricCard
        icon={<Bell />}
        label="Notificações por ler"
        value={unreadNotifications}
        footer={unreadNotifications > 0 ? 'serviços a terminar por rever' : 'tudo em dia'}
        tone={unreadNotifications > 0 ? 'warning' : 'neutral'}
      />
    </div>
  );
}
