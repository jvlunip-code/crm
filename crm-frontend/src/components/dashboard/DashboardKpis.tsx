import { KpiCard, KpiGrid } from '@/components/shared/KpiCard';
import { useDashboardSummary } from '@/hooks/use-dashboard';
import { useUnreadCount } from '@/hooks/use-notifications';
import { formatCount, formatCurrency } from '@/lib/utils';

/**
 * Dashboard KPI row. Every detail line is a breakdown of today's snapshot
 * (`/api/dashboard/summary/`), never a trend: there is no history to compare
 * against (PLAN.md decision 18).
 */
export function DashboardKpis() {
  const { data: summary, isLoading, isError } = useDashboardSummary();
  // Its own query so marking notifications read updates it at once.
  const unread = useUnreadCount();

  const missing = isError ? '—' : undefined;
  const closeAfter90 = summary
    ? Math.max(0, summary.ending.within180 - summary.ending.within90)
    : 0;
  const unreadCount = unread.data ?? 0;

  return (
    <KpiGrid role="group" aria-label="Indicadores principais">
      <KpiCard
        label="Clientes"
        to="/customers"
        loading={isLoading}
        value={summary ? formatCount(summary.customers.total) : missing}
        detail={
          summary && (
            <>
              <strong className="font-medium text-foreground">
                {formatCount(summary.customers.active)}
              </strong>{' '}
              ativos · {formatCount(summary.customers.inactive)} inativos
            </>
          )
        }
      />
      <KpiCard
        label="Serviços ativos"
        to="/services"
        loading={isLoading}
        value={summary ? formatCount(summary.services.active) : missing}
        detail={
          summary && (
            <>
              <strong className="font-medium text-foreground">
                {formatCurrency(summary.services.activeValue)}
              </strong>
              /mês · de {formatCount(summary.services.total)}
            </>
          )
        }
      />
      <KpiCard
        label="A terminar em 90 dias"
        to="/services?ending=90"
        loading={isLoading}
        value={summary ? formatCount(summary.ending.within90) : missing}
        detail={
          summary && (
            <>
              <strong
                className={
                  summary.ending.expired > 0
                    ? 'font-medium text-status-error-fg'
                    : 'font-medium text-foreground'
                }
              >
                {formatCount(summary.ending.expired)}
              </strong>{' '}
              já terminados · +{formatCount(closeAfter90)} até 180 dias
            </>
          )
        }
      />
      <KpiCard
        label="Notificações por ler"
        to="/notifications?estado=por-ler"
        loading={unread.isLoading}
        value={unread.isError ? '—' : formatCount(unreadCount)}
        detail={
          unread.isError ? undefined : unreadCount > 0 ? (
            <span className="font-medium text-status-warning-fg">serviços por rever</span>
          ) : (
            'Tudo em dia'
          )
        }
      />
    </KpiGrid>
  );
}
