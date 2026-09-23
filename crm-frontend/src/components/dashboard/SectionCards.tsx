import { Activity, Bell, Package, Users } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { useCustomers } from '@/hooks/use-customers';
import { useServices } from '@/hooks/use-services';
import { useUnreadCount } from '@/hooks/use-notifications';
import { useEvents } from '@/hooks/use-events';

/** KPI row: only figures the loaded data supports — no invented trends. */
export function SectionCards() {
  const { data: customers } = useCustomers();
  const { data: services } = useServices();
  const { data: unreadNotifications = 0 } = useUnreadCount();
  const { data: events } = useEvents();

  const activeCustomers = customers?.filter((c) => c.status === 'active').length ?? 0;
  const activeServices = services?.filter((s) => s.status === 'active').length ?? 0;
  const recentEvents = events?.slice(0, 30).length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={<Users />}
        label="Clientes"
        value={customers?.length ?? '—'}
        footer={`${activeCustomers} ativos`}
      />
      <MetricCard
        icon={<Package />}
        label="Serviços ativos"
        value={services ? activeServices : '—'}
        footer={`de ${services?.length ?? 0} no catálogo`}
      />
      <MetricCard
        icon={<Bell />}
        label="Notificações por ler"
        value={unreadNotifications}
        footer={unreadNotifications > 0 ? 'serviços a terminar por rever' : 'tudo em dia'}
        tone={unreadNotifications > 0 ? 'warning' : 'neutral'}
      />
      <MetricCard
        icon={<Activity />}
        label="Eventos recentes"
        value={events ? recentEvents : '—'}
        footer="últimos 30 registos"
      />
    </div>
  );
}
